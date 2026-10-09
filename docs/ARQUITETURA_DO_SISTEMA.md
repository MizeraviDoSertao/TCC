# Arquitetura do Sistema

> Documento global e oficial de arquitetura do FraudGuard. Base para o modelo
> **Spec Driven Development (SDD)**: toda nova especificação deve partir das
> regras, contratos e débitos registrados aqui.
>
> - Escopo: repositório completo (`fraud-dashboard/`, `tcc/`, `ml-fraud-py/`,
>   `docker-compose.yml`).
> - Base da análise: código-fonte, imports, chamadas, migrations e configurações
>   do branch `homolog` (commit `919d99e`).
> - Convenção: afirmações sem marcação refletem o código. Inferências estão
>   marcadas como **Hipótese**.
> - Documento irmão: [Objetivo do Sistema](./OBJETIVO_DO_SISTEMA.md).
> - Escopo do grupo (feito, a implementar, fora do escopo):
>   [Regras do Projeto](./REGRAS_DO_PROJETO.md).

## Sumário

1. [Visão arquitetural](#1-visão-arquitetural)
2. [Padrões utilizados](#2-padrões-utilizados)
3. [Regras arquiteturais](#3-regras-arquiteturais)
4. [Convenções técnicas](#4-convenções-técnicas)
5. [Separação de responsabilidades](#5-separação-de-responsabilidades)
6. [Fluxo de comunicação entre módulos](#6-fluxo-de-comunicação-entre-módulos)
7. [Contratos de integração](#7-contratos-de-integração)
8. [Modelo de dados](#8-modelo-de-dados)
9. [Dependências críticas](#9-dependências-críticas)
10. [Riscos técnicos, acoplamentos e violações](#10-riscos-técnicos-acoplamentos-e-violações)
11. [Diretrizes para futuras implementações](#11-diretrizes-para-futuras-implementações)
12. [Mapa da documentação](#12-mapa-da-documentação)

---

## 1. Visão arquitetural

O sistema é composto por **três aplicações** e **duas peças de infraestrutura**,
orquestradas pelo `docker-compose.yml` da raiz:

| Contêiner | Origem | Tecnologia | Papel |
| --- | --- | --- | --- |
| `frontend` (`fraude-dashboard`) | `fraud-dashboard/` | Angular 17 + Nginx 1.27 | Interface web; Nginx serve o SPA e faz proxy de `/process_fraud_automotive/` para o backend. |
| `backend` (`fraude-backend`) | `tcc/` | Java 21, Spring Boot 4.0.6 | API REST, ingestão (Spring Batch), arquitetura medalhão no PostgreSQL, outbox, orquestração do ciclo de vida do modelo. |
| `ml-service` (`fraude-ml`) | `ml-fraud-py/` | Python 3.12, scikit-learn, kafka-python | Treinamento de modelos e inferência (scoring) via Kafka. |
| `postgres` (`fraude-postgres`) | imagem `postgres:16` | PostgreSQL | Persistência (schemas `bronze`, `silver`, `gold`, `ops`, `review`, `ml` e tabelas do Spring Batch). |
| `kafka` (`fraude-kafka`) | imagem `apache/kafka:latest` | Kafka em modo KRaft | Barramento assíncrono entre backend e serviço de ML. |

Volumes nomeados: `fraud-postgres` (dados do banco), `fraud-imports`
(arquivos enviados, gravado pelo backend em `/data/imports` e montado
**somente leitura** no `ml-service`) e `fraud-models` (artefatos `.joblib` em
`/app/artifacts` no `ml-service`).

```mermaid
flowchart LR
  U[Usuário / Analista / Administrador] -->|HTTP :4200| FE[frontend<br/>Angular + Nginx]
  FE -->|/process_fraud_automotive/*| BE[backend<br/>Spring Boot]
  BE -->|JPA / JDBC / Flyway| PG[(PostgreSQL)]
  BE -->|transactions<br/>model-training-requests<br/>model-activation-requests| K{{Kafka}}
  K -->|fraud-results<br/>model-training-results<br/>model-activation-results| BE
  K <--> ML[ml-service<br/>Python]
  BE -. grava arquivos .-> VI[(volume fraud-imports)]
  ML -. lê arquivos (ro) .-> VI
  ML -. grava/lê .joblib .-> VM[(volume fraud-models)]
```

### 1.1 Estilo arquitetural

- **Distribuído orientado a eventos** entre backend e ML: nenhuma chamada HTTP
  entre os dois serviços; toda a integração passa pelo Kafka e por um volume de
  arquivos compartilhado.
- **Hexagonal (Ports & Adapters)** no backend Java (`tcc/`) e no pacote Python
  (`ml-fraud-py/fraud_detection/`), com desvios registrados na seção 10.
- **Arquitetura medalhão** (Bronze → Silver → Gold) no PostgreSQL, com schemas
  auxiliares `ops`, `review` e `ml`.
- **SPA com componentes standalone** e rotas *lazy-loaded* no frontend.

### 1.2 Dois fluxos de negócio independentes

| Fluxo | Entrada | Efeito | Altera o modelo ativo? |
| --- | --- | --- | --- |
| **Analisar** (importação) | `POST /imports` | Ingestão → Bronze/Silver → outbox → Kafka → scoring → Gold | Não |
| **Modelos** (governança) | `POST /models/train` e `POST /models/{id}/activate` | Treina candidato e, após ativação administrativa, troca o modelo usado no scoring | Sim, somente na ativação |

O backend recusa importações enquanto não existir modelo ativo
(`ImportDatasetService.importDataset` → `ActiveModelRepositoryOutPort.hasActiveModel`).

---

## 2. Padrões utilizados

| Padrão | Onde | Evidência no código |
| --- | --- | --- |
| Hexagonal / Ports & Adapters | Backend | `application/port/in`, `application/port/out`, `adapter/in`, `adapter/out` |
| Hexagonal (Protocols) | ML | `fraud_detection/ports.py` (`DatasetReader`, `ModelRepository`, `TrainingStrategy`) |
| Strategy + Factory | Backend | `DatasetReaderStrategy`, `CsvDatasetReaderStrategy`, `ExcelDatasetReaderStrategy`, `DatasetReaderFactory` |
| Strategy + Factory | ML | `SupervisedTrainingStrategy`, `AnomalyTrainingStrategy`, `TrainingStrategyFactory` |
| Reader / Processor / Writer (chunk 100) | Backend | `DatasetBatchConfiguration`, `DynamicDatasetItemReader`, `DynamicDatasetProcessor`, `DatasetBatchWriter` |
| Transactional Outbox | Backend | `ops.transaction_outbox`, `TransactionOutboxPersistenceAdapter`, `TransactionOutboxPublisher` |
| Specification Factory | Backend | `FraudResultSpecificationFactory` (filtros opcionais da Gold) |
| Mapper em tempo de compilação | Backend | MapStruct em `adapter/out/persistence/mapper` (`unmappedTargetPolicy = ERROR`) |
| Repository | Backend / ML | Spring Data JPA; `JoblibModelRepository` |
| Métodos de transição de estado em entidades | Backend | `ImportJobEntity.markProcessing/markFinished`, `ModelTrainingEntity.markReady/markActive`, `TransactionOutboxEntity.markPublished` |
| Tratamento global de exceções | Backend | `ApiExceptionHandler` (`@RestControllerAdvice`) |
| Consumer com retry + Dead Letter Topic | Backend / ML | `KafkaConsumerConfig` (`DefaultErrorHandler` + `DeadLetterPublishingRecoverer`); `KafkaScoringWorker._process_with_retry` |
| Pipeline de pré-processamento | ML | `preprocessing.build_preprocessor` dentro de `sklearn.Pipeline` (mesmo pipeline no treino e na inferência) |
| Escrita atômica de arquivo | ML | `JoblibModelRepository.save` (arquivo temporário + `os.replace`) |
| Hot reload por `mtime` | ML | `ReloadingFraudScoringService` |
| Componentes standalone + lazy loading | Frontend | `app.routes.ts` com `loadComponent` |
| Serviço HTTP por feature | Frontend | `ClaimService`, `ImportService`, `ModelService`, `DashboardService` |

---

## 3. Regras arquiteturais

As regras abaixo descrevem o padrão **vigente e pretendido**. Onde o código
atual as descumpre, há referência ao item da seção 10.

### 3.1 Backend (`tcc/`)

- **R-BE-01 — Direção de dependência:** `adapter/in → application/port/in →
  application/service → application/domain`; `application/service →
  application/port/out ← adapter/out`. A camada `application` não deve importar
  nada de `adapter` nem de `config`. *(Violado por AV-01.)*
- **R-BE-02 — Portas sem tipos de infraestrutura:** portas não expõem entidades
  JPA, `Page` do Spring Data, `MultipartFile` nem classes do Kafka. Controllers
  convertem dados de transporte em comandos (`ImportFileCommand`,
  `FraudReviewCommand`, `ClaimFilter`, `FraudResultFilter`). *(Respeitado.)*
- **R-BE-03 — Todo adaptador de entrada passa por uma porta de entrada.**
  *(Violado por AV-03 e AV-04.)*
- **R-BE-04 — Flyway é dono do schema:** `spring.jpa.hibernate.ddl-auto:
  validate`. Toda mudança de tabela exige nova migration `V<n>__*.sql`; nunca
  editar migrations já aplicadas.
- **R-BE-05 — Entidades sem setters públicos:** estado muda por métodos de
  domínio com intenção explícita (`confirmFraud`, `markFinished`...).
- **R-BE-06 — Validação de entrada lança `IllegalArgumentException`** via
  `Validation.requireArgument`, que o `ApiExceptionHandler` converte em HTTP 400.
  Recurso inexistente lança `ResourceNotFoundException` (HTTP 404).
- **R-BE-07 — Paginação limitada:** serviços aplicam `page >= 0` e
  `1 <= size <= 100` (`Math.clamp`).
- **R-BE-08 — Publicação para scoring somente via outbox:** a linha da Silver e
  o evento da outbox são gravados no mesmo chunk transacional do Spring Batch;
  o envio ao Kafka é feito pelo agendador.
- **R-BE-09 — Atributos dinâmicos em JSONB:** colunas do arquivo não viram
  colunas SQL; ficam em `original_data`/`normalized_data`. Novas colunas no
  dataset não exigem mudança de código nem de schema.

### 3.2 Serviço de ML (`ml-fraud-py/`)

- **R-ML-01 — `application` depende de `ports`/`domain`, não de
  `infrastructure`.** *(Violado por AV-05.)*
- **R-ML-02 — O mesmo `Pipeline` (pré-processamento + estimador) é
  persistido e usado na inferência.**
- **R-ML-03 — Todo artefato salvo gera manifesto `*.metadata.json`.**
- **R-ML-04 — O serviço de ML nunca escreve no PostgreSQL;** resultados
  voltam ao backend pelo Kafka.
- **R-ML-05 — Mensagens Kafka só são confirmadas (commit) após publicação do
  resultado ou envio ao DLT.**

### 3.3 Frontend (`fraud-dashboard/`)

- **R-FE-01 — Componentes coordenam estado de tela; serviços concentram as
  chamadas HTTP.**
- **R-FE-02 — Todas as chamadas usam o prefixo relativo
  `/process_fraud_automotive`,** resolvido por `proxy.conf.json` (dev) ou
  `nginx.conf` (contêiner).
- **R-FE-03 — Modelos TypeScript são `interface` com propriedades
  `readonly`,** espelhando os records Java.
- **R-FE-04 — Credenciais administrativas não são persistidas no
  navegador;** são enviadas como HTTP Basic apenas nas ações de treino e
  ativação.

### 3.4 Integração

- **R-INT-01 — Backend e ML se comunicam apenas por Kafka + volume
  `fraud-imports`.**
- **R-INT-02 — A normalização de nomes de coluna deve ser idêntica em Java
  (`DynamicDatasetProcessor.normalizeName`) e Python
  (`normalization.normalize_name`):** remover acentos (NFD), minúsculas,
  `[^a-z0-9]+ → _`, remover `_` das bordas.
- **R-INT-03 — Campos JSON trafegados no Kafka usam camelCase.**

---

## 4. Convenções técnicas

| Tema | Convenção observada |
| --- | --- |
| Pacote base Java | `com.unip.fraud` (groupId Maven `br.com.unip`, artifactId `tcc`) |
| Nomes de portas | `*UseCase` (entrada) e `*OutPort` (saída) |
| Nomes de adaptadores | `*PersistenceAdapter`, `*KafkaProducer`, `*KafkaConsumer`, `*Adapter` |
| DTOs de domínio | `record` Java imutáveis (`*View`, `*Command`, `*Filter`, `*Record`) |
| Entidades JPA | Lombok `@Getter @Builder`, construtores restritos, sem setters |
| Injeção | Construtor explícito com parâmetros `final` |
| Indentação Java | 2 espaços (exceto `FraudApplication.java`, com 4) |
| Indentação Python | 2 espaços na maior parte; 4 espaços em `training/*` e `model_repository.py` |
| Python | `from __future__ import annotations`, `@dataclass(frozen=True, slots=True)`, `Protocol` para portas |
| Configuração | Variáveis de ambiente com default em `application.yml` (`${VAR:default}`) e em `config.Settings.from_environment()` |
| Migrations | `tcc/src/main/resources/db/migration/V<n>__descricao.sql` |
| API | Context path `/process_fraud_automotive`; respostas de erro `ApiError {status, error, message, timestamp}` |
| Paginação | `PageResponse {content, page, size, totalElements, totalPages}` (Java) ≡ `PagedResponse` (TS) |
| Datas | `LocalDateTime` sem fuso no backend; Python usa UTC (`datetime.now(UTC)`) |
| Mensagens de erro da API | Em inglês |
| Textos de interface | Em português (pt-BR) |
| Testes Java | JUnit 5 com *fakes* manuais das portas (sem Mockito) |
| Testes Python | `unittest` (`python -m unittest discover -s tests -v`) |

---

## 5. Separação de responsabilidades

| Responsabilidade | Dono | Não deve fazer |
| --- | --- | --- |
| Upload, validação de formato/tamanho, deduplicação por SHA-256 | Backend | — |
| Leitura de CSV/XLS/XLSX para ingestão | Backend (`adapter/in/batch`) | — |
| Normalização de nomes e valores, detecção de rótulo | Backend (`DynamicDatasetProcessor`) | — |
| Persistência Bronze/Silver/Gold/ops/review/ml | Backend | ML não acessa o banco |
| Publicação confiável de transações para scoring | Backend (outbox + scheduler) | — |
| Treinamento de modelo | ML (`ModelTrainingService` Python) | Backend não treina |
| Inferência / scoring | ML (`FraudScoringService`) | Backend não executa modelo |
| Promoção do artefato candidato a ativo | ML (`KafkaModelManagementWorker._activate`) | — |
| Registro de status de treino/ativação e auditoria | Backend (`ml.model_training`, `ml.model_registry`) | — |
| Revisão humana (decisão de fraude) | Backend (`FraudReviewService`) | Sem interface no frontend (OR-03) |
| Autenticação | Backend (`SecurityConfig`) | — |
| Apresentação, filtros e paginação na tela | Frontend | Sem regra de negócio |

Mapa por módulo e responsabilidade principal:

| Módulo | Responsabilidade principal | README |
| --- | --- | --- |
| `tcc/` | Serviço backend | [tcc/README.md](../tcc/README.md) |
| `tcc/.../application` | Casos de uso, domínio e portas | [README](../tcc/src/main/java/com/unip/fraud/application/README.md) |
| `tcc/.../adapter/in` | HTTP, Kafka consumers, scheduler | [README](../tcc/src/main/java/com/unip/fraud/adapter/in/README.md) |
| `tcc/.../adapter/in/batch` | Pipeline de importação | [README](../tcc/src/main/java/com/unip/fraud/adapter/in/batch/README.md) |
| `tcc/.../adapter/out` | PostgreSQL, Kafka producers, storage, launcher do Batch | [README](../tcc/src/main/java/com/unip/fraud/adapter/out/README.md) |
| `tcc/.../config` | Wiring de Batch, Kafka, Hibernate e segurança | [README](../tcc/src/main/java/com/unip/fraud/config/README.md) |
| `tcc/src/main/resources/db/migration` | Schema do banco | [README](../tcc/src/main/resources/db/migration/README.md) |
| `ml-fraud-py/` | Serviço de ML | [ml-fraud-py/README.md](../ml-fraud-py/README.md) |
| `ml-fraud-py/fraud_detection` | Núcleo: domínio, portas, normalização, CLI | [README](../ml-fraud-py/fraud_detection/README.md) |
| `ml-fraud-py/fraud_detection/application` | Serviços de treino e scoring | [README](../ml-fraud-py/fraud_detection/application/README.md) |
| `ml-fraud-py/fraud_detection/training` | Estratégias de treinamento | [README](../ml-fraud-py/fraud_detection/training/README.md) |
| `ml-fraud-py/fraud_detection/infrastructure` | Kafka, datasets, artefatos | [README](../ml-fraud-py/fraud_detection/infrastructure/README.md) |
| `fraud-dashboard/` | Frontend | [fraud-dashboard/README.md](../fraud-dashboard/README.md) |
| `fraud-dashboard/src/app` | Shell, painel e modelos compartilhados | [README](../fraud-dashboard/src/app/README.md) |
| `fraud-dashboard/src/app/imports` | Tela "Analisar" | [README](../fraud-dashboard/src/app/imports/README.md) |
| `fraud-dashboard/src/app/claims` | Tela "Sinistros" | [README](../fraud-dashboard/src/app/claims/README.md) |
| `fraud-dashboard/src/app/transaction-detail` | Detalhe de uma análise | [README](../fraud-dashboard/src/app/transaction-detail/README.md) |
| `fraud-dashboard/src/app/models` | Tela "Modelos" | [README](../fraud-dashboard/src/app/models/README.md) |

---

## 6. Fluxo de comunicação entre módulos

### 6.1 Importação e scoring (fluxo "Analisar")

```mermaid
sequenceDiagram
  autonumber
  actor A as Analista
  participant FE as Frontend (imports)
  participant API as ImportController
  participant S as ImportDatasetService
  participant ST as LocalImportFileStorageAdapter
  participant L as ImportJobLauncherAdapter (@Async)
  participant B as Spring Batch (datasetImportJob)
  participant DB as PostgreSQL
  participant P as TransactionOutboxPublisher (@Scheduled)
  participant K as Kafka
  participant ML as KafkaScoringWorker (Python)
  participant C as FraudResultKafkaConsumer

  A->>FE: seleciona CSV/XLS/XLSX
  FE->>API: POST /imports (multipart "file")
  API->>S: importDataset(ImportFileCommand)
  S->>S: valida nome, tamanho (≤ 50 MB), extensão
  S->>DB: existe modelo ativo? (ml.model_registry)
  S->>ST: store() → arquivo + SHA-256
  S->>DB: busca import com mesmo hash (QUEUED/PROCESSING/COMPLETED*)
  alt duplicado
    S->>ST: discard(); retorna import existente
  else novo
    S->>DB: ops.import_job (QUEUED)
    S->>L: launch()
    API-->>FE: 202 Accepted + ImportJobView
    L->>B: JobOperator.start(importId, filePath, originalFileName)
    B->>DB: listener: status PROCESSING
    loop chunks de 100 linhas
      B->>B: ler (Strategy CSV/Excel) → normalizar (Processor)
      B->>DB: bronze.claim_raw (sempre)
      alt linha válida
        B->>DB: silver.claim + bronze.dataset_schema + ops.transaction_outbox (PENDING)
      else linha inválida
        B->>DB: ops.rejected_record
      end
    end
    B->>DB: listener: COMPLETED / COMPLETED_WITH_WARNINGS / FAILED + contagens
  end
  loop a cada OUTBOX_PUBLISH_DELAY_MS (1 s)
    P->>DB: SELECT ... FOR UPDATE SKIP LOCKED (até 100 PENDING)
    P->>K: transactions {transactionId, realFraud, features}
    P->>DB: PUBLISHED (ou attempts+1 em falha)
  end
  K->>ML: transactions
  ML->>ML: carrega fraud_model.joblib (recarrega se mtime mudou) e pontua
  ML->>K: fraud-results (ou transactions.DLT após N tentativas)
  K->>C: fraud-results
  C->>DB: upsert gold.fraud_prediction
  FE->>API: GET /dashboard/summary, /dashboard/results (polling 60 s)
```

### 6.2 Treinamento e ativação (fluxo "Modelos")

```mermaid
sequenceDiagram
  autonumber
  actor ADM as Administrador
  participant FE as Frontend (models)
  participant MC as ModelController
  participant MS as ModelTrainingService (Java)
  participant DB as PostgreSQL
  participant K as Kafka
  participant MM as KafkaModelManagementWorker (Python)
  participant LC as ModelLifecycleKafkaConsumer

  ADM->>FE: dataset + usuário/senha
  FE->>MC: POST /models/train (HTTP Basic, role MODEL_ADMIN)
  MC->>MS: requestTraining()
  MS->>DB: ml.model_training QUEUED → TRAINING
  MS->>K: model-training-requests {trainingId, datasetPath, datasetHash}
  MC-->>FE: 202 + ModelTrainingView
  K->>MM: model-training-requests
  MM->>MM: treina (RF supervisionado ou Isolation Forest)
  MM->>MM: salva artifacts/candidates/{trainingId}.joblib (+ manifesto)
  MM->>K: model-training-results {status READY|FAILED, métricas...}
  K->>LC: model-training-results
  LC->>MS: finishTraining() → READY | FAILED
  ADM->>FE: "Ativar modelo"
  FE->>MC: POST /models/{id}/activate (HTTP Basic)
  MC->>MS: requestActivation() → ACTIVATING
  MS->>K: model-activation-requests {trainingId}
  K->>MM: model-activation-requests
  MM->>MM: copia candidato → fraud_model.joblib
  MM->>K: model-activation-results {status ACTIVE|ACTIVATION_FAILED}
  K->>LC: model-activation-results
  LC->>MS: finishActivation()
  MS->>DB: desativa anterior; marca ACTIVE; upsert ml.model_registry (active=TRUE)
  Note over MM: KafkaScoringWorker detecta novo mtime<br/>e passa a usar o modelo ativado
```

### 6.3 Revisão humana

`POST /claims/{transactionId}/reviews` → `FraudReviewService.review` (transacional):
grava `review.fraud_review` e atualiza `confirmed_fraud` em `silver.claim` e,
se existir, em `gold.fraud_prediction`. `FRAUD → true`, `LEGITIMATE → false`,
`INCONCLUSIVE → null`. Não há tela para essa operação (OR-03).

### 6.4 Máquinas de estado

```text
ops.import_job.status
  QUEUED ─► PROCESSING ─► COMPLETED
                      ├─► COMPLETED_WITH_WARNINGS   (há linhas rejeitadas)
                      └─► FAILED ─(POST /imports/{id}/retry)─► QUEUED

ml.model_training.status
  QUEUED ─► TRAINING ─► READY ─► ACTIVATING ─► ACTIVE ─(outro ativado)─► READY
                   └─► FAILED          └─► ACTIVATION_FAILED ─► ACTIVATING

ops.transaction_outbox.status
  PENDING ─► PUBLISHED      (falha: continua PENDING, attempts++)
```

---

## 7. Contratos de integração

### 7.1 API HTTP (backend)

Base: `http://<host>:8080/process_fraud_automotive` (no contêiner do
frontend: `http://localhost:4200/process_fraud_automotive`).

| Método | Caminho | Segurança | Porta de entrada / serviço | Consumidor no frontend |
| --- | --- | --- | --- | --- |
| `POST` | `/imports` | pública | `ImportDatasetUseCase.importDataset` | `ImportService.upload` |
| `GET` | `/imports?page&size` | pública | `GetImportsUseCase.getImports` | `ImportService.list` |
| `GET` | `/imports/{importId}` | pública | `GetImportsUseCase.getImport` | — |
| `POST` | `/imports/{importId}/retry` | pública | `ImportDatasetUseCase.retry` | `ImportService.retry` |
| `GET` | `/imports/{importId}/errors?page&size` | pública | `GetImportErrorsUseCase.getErrors` | `ImportService.errors` |
| `GET` | `/imports/{importId}/schema` | pública | `GetClaimsUseCase.getSchema` | `ClaimService.schema` |
| `GET` | `/claims?importId&search&field&value&page&size` | pública | `GetClaimsUseCase.getClaims` | `ClaimService.list` |
| `GET` | `/claims/{transactionId}` | pública | `GetClaimsUseCase.getClaim` | — |
| `POST` | `/claims/{transactionId}/reviews` | pública | `ReviewFraudUseCase.review` | — |
| `GET` | `/dashboard/summary` | pública | `GetDashboardUseCase.getSummary` | `DashboardService.getSummary` |
| `GET` | `/dashboard/results?predictedFraud&realFraud&minProbability&startDate&endDate&riskLevel&modelVersion&page&size` | pública | `GetFraudResultsUseCase.getResults` | `DashboardService.getResults` |
| `GET` | `/dashboard/results/{transactionId}` | pública | `GetFraudResultDetailUseCase.getResultDetail` | `DashboardService.getResultDetail` |
| `GET` | `/models` | pública | `ModelTrainingService.list` (sem porta) | `ModelService.list` |
| `POST` | `/models/train` | `MODEL_ADMIN` | `ModelTrainingService.requestTraining` (sem porta) | `ModelService.train` |
| `POST` | `/models/{trainingId}/activate` | `MODEL_ADMIN` | `ModelTrainingService.requestActivation` (sem porta) | `ModelService.activate` |

Códigos de erro (`ApiExceptionHandler`): 400 (`IllegalArgumentException`,
corpo ilegível, validação de bean), 403 (`SecurityException`), 404
(`ResourceNotFoundException`), 413 (`MaxUploadSizeExceededException`). 401 vem
do Spring Security (HTTP Basic).

### 7.2 Tópicos Kafka

| Tópico | Partições | Produtor | Consumidor (group id) | Chave | Payload |
| --- | --- | --- | --- | --- | --- |
| `transactions` | 3 | `TransactionKafkaProducer` (Java) | `KafkaScoringWorker` (`ml-fraud-consumer`) | `transactionId` | `{transactionId, realFraud, features}` |
| `fraud-results` | 3 | `KafkaScoringWorker` | `FraudResultKafkaConsumer` (`fraud-api`) | `transactionId` | `{transactionId, realFraud, predictedFraud, probability, scoreType, riskLevel, threshold, classification, modelVersion, reasons}` |
| `fraud-results.DLT` | 3 | `DeadLetterPublishingRecoverer` (Java) | — | — | mensagem original |
| `transactions.DLT` | não criado pelo Java | `KafkaScoringWorker` | — | `transactionId` | `{source, error, topic, partition, offset}` |
| `model-training-requests` | 1 | `ModelLifecycleKafkaProducer` | `KafkaModelManagementWorker` (`ml-model-manager`) | `trainingId` | `{trainingId, datasetPath, datasetHash}` |
| `model-training-results` | 1 | `KafkaModelManagementWorker` | `ModelLifecycleKafkaConsumer` (`fraud-api-model-training`) | `trainingId` | `{trainingId, status: READY\|FAILED, modelVersion, modelType, artifactPath, rows, featureCount, targetColumn, metrics, datasetSha256, error}` |
| `model-activation-requests` | 1 | `ModelLifecycleKafkaProducer` | `KafkaModelManagementWorker` (`ml-model-manager`) | `trainingId` | `{trainingId}` |
| `model-activation-results` | 1 | `KafkaModelManagementWorker` | `ModelLifecycleKafkaConsumer` (`fraud-api-model-activation`) | `trainingId` | `{trainingId, status: ACTIVE\|ACTIVATION_FAILED, modelVersion, error}` |

Observações de contrato:

- `datasetHash` é enviado pelo Java, mas o Python o ignora e recalcula o SHA-256
  do arquivo (`application/training.py::_sha256`).
- `FraudScoringMessage` (Java) aceita `riskScore` como alternativa a
  `probability` e normaliza valores em escala 0–100 para 0–1. O Python sempre
  envia `probability` em 0–1.
- Faixas de risco: `HIGH ≥ 0,7`, `MEDIUM ≥ 0,3`, senão `LOW` — calculadas no
  Python (`scoring._risk_level`) e repetidas como *fallback* no Java
  (`FraudResultKafkaConsumer`) e na migration V5.

### 7.3 Sistema de arquivos compartilhado

O backend grava o upload em `IMPORT_STORAGE_PATH`
(`/data/imports/{uuid}-{nomeSanitizado}`) e envia esse **caminho absoluto**
em `datasetPath`. O `ml-service` lê o mesmo caminho pelo volume
`fraud-imports` montado em `/data/imports:ro`.

---

## 8. Modelo de dados

Detalhes por migration em
[`db/migration/README.md`](../tcc/src/main/resources/db/migration/README.md).

| Schema.tabela | Chave | Escrita por | Leitura por |
| --- | --- | --- | --- |
| `ops.import_job` | `id UUID` | `ImportDatasetService`, `ImportJobBatchListener`, `ImportJobLauncherAdapter` | API `/imports` |
| `bronze.claim_raw` | `id BIGSERIAL`, único `(import_id, sheet_name, row_number)` | `DatasetBatchWriter` | Dashboard (contagem) |
| `bronze.dataset_schema` | `id`, único `(import_id, sheet_name, original_name)` | `DatasetBatchWriter` | `/imports/{id}/schema` |
| `silver.claim` | `transaction_id` | `DatasetBatchWriter`, `FraudReviewService` | `/claims`, detalhe da Gold, dashboard |
| `gold.fraud_prediction` | `transaction_id` | `FraudResultKafkaConsumer`, `FraudReviewService` | `/dashboard/*` |
| `ops.rejected_record` | `id BIGSERIAL` | `DatasetBatchWriter` | `/imports/{id}/errors`, dashboard |
| `ops.transaction_outbox` | `id UUID`, único `(aggregate_id, event_type)` | `DatasetBatchWriter`, `TransactionOutboxPublisher` | `TransactionOutboxPublisher` |
| `review.fraud_review` | `id BIGSERIAL` | `FraudReviewService` | ninguém (OR-03) |
| `ml.model_training` | `id UUID`; índice único parcial `active = TRUE` | `ModelTrainingService` | `/models` |
| `ml.model_registry` | `model_version` | `ModelTrainingService.registerActiveModel` (JDBC) | `ModelRegistryPersistenceAdapter.hasActiveModel` |
| `BATCH_*` (Spring Batch) | — | Spring Batch (`initialize-schema: always`) | `ImportJobLauncherAdapter.restart` |

**Identidade da transação:** `transactionId = UUID.nameUUIDFromBytes(importId +
":" + sheetName + ":" + rowNumber)` (UUID v3 determinístico). Reiniciar o mesmo
import não duplica sinistros; reimportar o arquivo em outro import gera IDs
novos.

---

## 9. Dependências críticas

### 9.1 Backend (`tcc/pom.xml`)

| Dependência | Versão | Uso crítico |
| --- | --- | --- |
| Spring Boot parent | 4.0.6 | Web, Data JPA, Batch, Validation, Security, Flyway |
| Java | 21 | `switch` com *pattern matching*, `Math.clamp`, records |
| spring-kafka | gerida pelo Boot | Producers, `@KafkaListener`, DLT |
| PostgreSQL driver + flyway-database-postgresql | gerida pelo Boot | Banco e migrations |
| Apache POI `poi-ooxml` | 5.5.1 | Leitura XLS/XLSX |
| Apache Commons CSV | 1.14.1 | Leitura CSV |
| MapStruct | 1.6.3 | Mapeamento entidade ↔ domínio |
| Lombok (+ `lombok-mapstruct-binding` 0.2.0) | 1.18.46 | Entidades |
| `jackson-datatype-jsr310` (Jackson 2) | gerida pelo Boot | Serialização de `java.time` nas colunas JSONB do Hibernate |
| `tools.jackson.databind.ObjectMapper` (Jackson 3) | gerida pelo Boot | Serialização em Kafka e métricas |

### 9.2 Serviço de ML (`ml-fraud-py/requirements.txt`)

`pandas >=2.2,<4`, `scikit-learn >=1.5,<2`, `joblib >=1.4,<2`,
`kafka-python >=2.2,<3`, `openpyxl >=3.1,<4`, `xlrd >=2,<3`. Python ≥ 3.11
(imagem 3.12-slim). Não há *lockfile*: versões são resolvidas no build.

### 9.3 Frontend (`fraud-dashboard/package.json`)

Angular `^17.3.0` (core, common, forms, router, platform-browser),
RxJS `~7.8.0`, TypeScript `~5.4.0`, zone.js `~0.14.0`; build com
`@angular-devkit/build-angular:application`; imagem `node:20-alpine` →
`nginx:1.27-alpine`. Há `package-lock.json`.

### 9.4 Dependências entre módulos

```text
fraud-dashboard ──HTTP──► tcc (API REST)
tcc ──Kafka──► ml-fraud-py      (transactions, model-*-requests)
ml-fraud-py ──Kafka──► tcc      (fraud-results, model-*-results)
ml-fraud-py ──arquivo──► volume fraud-imports (gravado por tcc)
tcc ──JDBC──► PostgreSQL
tcc ──consulta──► ml.model_registry para liberar importações
ml-fraud-py ──arquivo──► fraud_model.joblib (estado do modelo ativo)
```

Critical path de inicialização (compose): `postgres` e `kafka` saudáveis →
`backend` e `ml-service` → `frontend` (depende só de `backend` iniciado).

---

## 10. Riscos técnicos, acoplamentos e violações

Identificadores estáveis: os READMEs dos módulos referenciam estes códigos.
Ao resolver um item, atualizar esta tabela e o README do módulo afetado.

### 10.1 Violações arquiteturais (AV)

| ID | Descrição | Arquivos |
| --- | --- | --- |
| AV-01 | `ModelTrainingService` está em `application/service`, mas importa classes de adaptador (`ModelTrainingEntity`, `ModelTrainingRepository`, `ModelLifecycleKafkaProducer`), usa `JdbcTemplate` com SQL e não implementa nenhuma porta de entrada. Viola R-BE-01. | `application/service/ModelTrainingService.java` |
| AV-02 | A entidade JPA `ModelTrainingEntity` constrói a view de aplicação (`toView`) e faz parse de JSON com `ObjectMapper`; o status é `String` livre, sem usar o enum `ModelTrainingStatus`. | `adapter/out/persistence/entity/ModelTrainingEntity.java` |
| AV-03 | Adaptadores de entrada chamam portas de saída diretamente, sem porta de entrada: `FraudResultKafkaConsumer` (regras de score, risco e classificação no adaptador), `DatasetBatchWriter` e `DynamicDatasetProcessor` (regras de normalização e rótulo em `adapter/in/batch`), `TransactionOutboxPublisher` e `ImportJobBatchListener` (este em `config/batch`, com regra de transição de status). Viola R-BE-03. | `adapter/in/kafka`, `adapter/in/batch`, `adapter/in/scheduler`, `config/batch` |
| AV-04 | `ModelController` e `ModelLifecycleKafkaConsumer` dependem da classe concreta `ModelTrainingService` e usam os records internos `TrainingResult`/`ActivationResult` como contrato de transporte. | `adapter/in/ModelController.java`, `adapter/in/kafka/ModelLifecycleKafkaConsumer.java` |
| AV-05 | Python: `application/scoring.py` importa `infrastructure.model_repository.JoblibModelRepository` (application → infrastructure). `infrastructure/model_management.py` instancia o serviço de aplicação e adaptadores concretos (composição fora do `cli.py`). `KafkaScoringWorker` é anotado com `FraudScoringService`, mas recebe `ReloadingFraudScoringService` (duck typing). Viola R-ML-01. | `fraud_detection/application/scoring.py`, `fraud_detection/infrastructure/*.py` |
| AV-06 | Regras duplicadas entre serviços sem fonte única: faixas de risco (Python, Java, migration V5), vocabulário de rótulos (Java `LABEL_VALUES` × Python `parse_binary_target`), normalização de nomes (R-INT-02), aliases do alvo (`IMPORT_TARGET_ALIASES` × `FRAUD_TARGET_ALIASES`) e nomes de tópicos (`application.yml` × `config.py`). | vários |

### 10.2 Módulos, artefatos e código órfãos (OR)

| ID | Descrição |
| --- | --- |
| OR-01 | Enum Java `ModelTrainingStatus` não é referenciado em nenhum lugar. |
| OR-02 | Constante `ClaimQueryService.NAME = "Pablo Junior"` não é usada. |
| OR-03 | `POST /claims/{id}/reviews`, `GET /claims/{id}` e `GET /imports/{id}` não têm consumidor no frontend; `review.fraud_review` só é escrita, nunca lida. |
| OR-04 | `ml.model_registry` serve apenas como indicador de modelo ativo: `feature_schema` é sempre `'{}'` e `threshold` é `NULL`. O manifesto `*.metadata.json` do Python não é sincronizado com essa tabela, embora o README antigo do ML sugerisse isso. |
| OR-05 | Compatibilidade legada no consumidor de resultados (`riskScore`, escala 0–100, `modelVersion` padrão `legacy-model`) e migration V5 (tabelas `public.*`). **Hipótese:** resquícios de uma versão anterior do produtor de resultados. |
| OR-06 | Arquivos versionados que não fazem parte do build: `tcc/.codex_tmp/build_sinistros_teste.mjs` (gera planilha de teste usando `@oai/artifact-tool`, dependência não declarada; a pasta está no `.gitignore`, mas o arquivo continua rastreado), `ml-fraud-py/artifacts/candidates/*.joblib` (o `.gitignore` cobre só `artifacts/*.joblib`), `ml-fraud-py/.idea/`, `.DS_Store` na raiz (o padrão `.DS_Store/` do `.gitignore` raiz só casa com diretórios) e o build compilado `fraud-dashboard/dist/` (16 arquivos, sem regra no `.gitignore`; fora do escopo segundo as [Regras do Projeto](./REGRAS_DO_PROJETO.md)). |
| OR-07 | `tcc/FLUXO_ANALISE.md` é apenas um ponteiro e `tcc/ARCHITECTURE.md` está desatualizado (não cobre `/models`, segurança, `ml.model_training` nem `/dashboard/results/{id}`). Substituídos por este documento. |

### 10.3 Riscos técnicos e débitos (RT)

| ID | Severidade | Descrição |
| --- | --- | --- |
| RT-01 | Alta | **Acoplamento por sistema de arquivos:** o backend envia um caminho absoluto local (`datasetPath`) que só funciona porque ambos os contêineres montam o mesmo volume em `/data/imports`. Implantação em hosts diferentes quebra o treinamento. |
| RT-02 | Alta | **Contratos Kafka implícitos:** payloads montados com `Map`/`dict` em cada lado, sem schema, versionamento nem testes de contrato entre serviços. |
| RT-03 | Alta | **Hipótese — diferença entre treino e inferência:** o treino lê o arquivo bruto com pandas, sem a normalização de valores do Java; a inferência recebe valores já normalizados pelo backend (datas como texto ISO, moeda brasileira convertida em número). Colunas de data tipadas como numéricas no treino (ver manifesto versionado) tendem a virar `NaN` e ser imputadas na inferência. |
| RT-04 | Alta | **Hipótese — vazamento de identificadores:** nenhuma regra exclui colunas identificadoras das features. O candidato versionado usa `id_sinistro`, `numero_apolice` e `segurado_id` como features categóricas e reporta todas as métricas = 1,0, indício de sobreajuste. |
| RT-05 | Alta | **Segurança:** só `POST /models/**` exige autenticação; importação, retry e revisão humana são públicos e anônimos (`reviewer` é texto livre). CSRF desabilitado; usuário único em memória com senha padrão `admin-local`; HTTP Basic sem TLS no compose; PostgreSQL `postgres/postgres` e Kafka PLAINTEXT. |
| RT-06 | Média | **Outbox sem limite de tentativas:** falhas só incrementam `attempts`; o evento continua `PENDING` e é reenviado a cada ciclo, sem backoff. `publishPending` envia até 100 eventos com `get(30s)` cada dentro de uma única transação que mantém `FOR UPDATE`. |
| RT-07 | Média | **Tópicos DLT não provisionados:** o Java cria só `fraud-results.DLT`. `transactions.DLT` (Python) e `model-training-results.DLT`/`model-activation-results.DLT` (o `DefaultErrorHandler` se aplica a todos os listeners) dependem de criação automática pelo broker. **Hipótese:** funciona porque a imagem `apache/kafka` mantém `auto.create.topics.enable=true` por padrão. |
| RT-08 | Média | **Duas fontes de verdade do modelo ativo:** o Python usa o arquivo `fraud_model.joblib`; o Java usa `ml.model_training`/`ml.model_registry`. Uma falha entre a cópia do artefato e o processamento de `model-activation-results` deixa os dois divergentes, sem reconciliação. |
| RT-09 | Média | **Progresso de importação só no final:** `totalRows` e `processedRows` são preenchidos apenas em `afterJob`; durante o processamento a barra de progresso fica em 0%. |
| RT-10 | Média | **Corrida entre revisão e score:** se a revisão humana ocorrer antes do resultado do modelo, o resultado posterior grava em Gold o `realFraud` original da outbox e sobrescreve a revisão. `INCONCLUSIVE` também apaga (`null`) o rótulo vindo do dataset. |
| RT-11 | Média | **Hipótese — desempenho de busca:** `/claims` usa `ILIKE` sobre `normalized_data::text` e sobre `->> campo`; o índice GIN `jsonb_ops` não atende `ILIKE`, o que tende a varredura completa com volume alto. |
| RT-12 | Baixa | **Hipótese — memória:** `WorkbookFactory.create` carrega a planilha inteira e o pandas lê o arquivo inteiro; arquivos próximos de 50 MB podem pressionar a memória dos contêineres (sem limites definidos no compose). |
| RT-13 | Baixa | **Gestor de modelos com uma única thread:** o treino é síncrono e bloqueia ativações enquanto roda. Em exceção, a mensagem não recebe commit e pode ser reprocessada após reinício. |
| RT-14 | Média | **Lacunas de testes:** não há testes para `ModelTrainingService`, `FraudReviewService`, controllers, outbox/publisher, `KafkaModelManagementWorker` e nenhum teste no frontend. |
| RT-15 | Baixa | **Infraestrutura:** imagem `apache/kafka:latest` sem versão fixa; duas versões de Jackson coexistem (Jackson 3 na aplicação, Jackson 2 no mapeamento JSON do Hibernate); Python sem lockfile. |
| RT-16 | Baixa | **Semântica ambígua:** `pendingReview` no dashboard conta resultados com `predictedFraud IS NULL` (modelos de anomalia), não revisões pendentes em `review.fraud_review`. |
| RT-17 | Baixa | **Frontend:** o cabeçalho exibe "Ambiente produtivo · Operacional" fixo no código, sem relação com o estado real; a senha administrativa é digitada a cada ação. |

---

## 11. Diretrizes para futuras implementações

### 11.1 Fluxo Spec Driven Development

1. **Especificar:** escrever a spec da mudança (problema, contrato, critérios de
   aceite) referenciando seções deste documento e, se aplicável, os IDs da
   seção 10 que a mudança resolve ou agrava. A spec fica em
   `specs/NNN-nome/spec.md`, segue o modelo
   [`.specify/templates/spec-template.md`](../.specify/templates/spec-template.md)
   e respeita a [constituição](../.specify/memory/constitution.md). No Claude
   Code, `/especificar <pedido>` cria a spec seguindo esses arquivos. Detalhes
   em [specs/README.md](../specs/README.md).
2. **Atualizar contratos primeiro:** alterações de API (seção 7.1), tópicos
   (7.2) ou tabelas (8) devem ser documentadas antes do código.
3. **Implementar respeitando as regras da seção 3.**
4. **Testar:** `./mvnw clean verify` (backend), `python -m unittest discover -s
   tests -v` (ML), `npm run build` (frontend).
5. **Sincronizar documentação:** atualizar o README do módulo e este documento
   no mesmo commit da mudança.

### 11.2 Backend

- Novo caso de uso: criar `*UseCase` em `application/port/in`, implementar em
  `application/service`, expor no adaptador de entrada. Nunca injetar serviço
  concreto em controller.
- Nova dependência externa: criar `*OutPort` em `application/port/out` e o
  adaptador em `adapter/out`; não importar Spring Data, JDBC ou Kafka em
  `application`.
- Nova tabela ou coluna: nova migration Flyway; atualizar entidade, mapper
  MapStruct e o README de migrations.
- Ao trabalhar no ciclo de vida de modelos, priorizar a correção de AV-01,
  AV-02 e AV-04 (porta de entrada, porta de saída para o registro e uso do enum
  `ModelTrainingStatus`).
- Novos dados de linha devem continuar em JSONB (R-BE-09).

### 11.3 Serviço de ML

- Novas estratégias de treino: implementar o `Protocol` `TrainingStrategy` e
  registrar em `TrainingStrategyFactory`.
- Toda mudança no formato de `ScoringResult.to_event()` ou nos resultados de
  treino/ativação exige mudança coordenada no Java (`FraudScoringMessage`,
  `ModelTrainingService.TrainingResult/ActivationResult`).
- Mudanças em `normalize_name` exigem a mesma mudança em
  `DynamicDatasetProcessor.normalizeName` (R-INT-02).

### 11.4 Frontend

- Nova tela: pasta própria em `src/app/<feature>/` com `*.component.*`,
  `*.service.ts` e `*.model.ts`; registrar rota *lazy* em `app.routes.ts` e
  link no `RootComponent`.
- Novos endpoints: sempre via serviço, com o prefixo
  `/process_fraud_automotive`.

### 11.5 Integração e operação

- Novo tópico: declarar em `KafkaTopicConfig` (incluindo o `.DLT`), em
  `application.yml`, em `config.py` e na tabela 7.2.
- Novas variáveis de ambiente: documentar no README do módulo e no
  `docker-compose.yml`.
- Nunca versionar artefatos de modelo, dados de clientes ou arquivos de IDE.

---

## 12. Mapa da documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/OBJETIVO_DO_SISTEMA.md](./OBJETIVO_DO_SISTEMA.md) | Propósito, atores, fluxos de negócio, visão de produto |
| [docs/ARQUITETURA_DO_SISTEMA.md](./ARQUITETURA_DO_SISTEMA.md) | Este documento |
| [docs/REGRAS_DO_PROJETO.md](./REGRAS_DO_PROJETO.md) | Regras do grupo: o que já foi feito, o que ainda será implementado e o que está fora do escopo, com conferência no código |
| [specs/README.md](../specs/README.md) | Especificações das mudanças (Spec Driven Development), modelo e constituição |
| [README.md](../README.md) | Como executar o projeto |
| READMEs de módulo | Listados na seção 5 |
| `tcc/ARCHITECTURE.md`, `tcc/FLUXO_ANALISE.md` | Histórico; substituídos por este documento (OR-07) |
