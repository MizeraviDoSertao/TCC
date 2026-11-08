# tcc — Backend Fraud API (Java / Spring Boot)

> Documentos globais: [Arquitetura do Sistema](../docs/ARQUITETURA_DO_SISTEMA.md) ·
> [Objetivo do Sistema](../docs/OBJETIVO_DO_SISTEMA.md). Códigos `AV-`, `OR-` e
> `RT-` referem-se à seção 10 da Arquitetura.

## Objetivo do módulo

Serviço central do FraudGuard. Expõe a API REST consumida pelo frontend,
ingere datasets de sinistros, mantém a arquitetura medalhão no PostgreSQL,
publica transações para scoring e orquestra o ciclo de vida dos modelos de ML.

## Responsabilidade principal

Ser o **dono dos dados e dos estados** do sistema: importações, linhas
Bronze/Silver, resultados Gold, rejeições, revisões humanas e registro de
treinos/ativações. **Não** treina nem executa modelos (responsabilidade do
`ml-fraud-py`).

## Funcionalidades existentes

- Upload de CSV/XLS/XLSX com validação de formato, tamanho e deduplicação por
  SHA-256; exige modelo ativo.
- Importação assíncrona via Spring Batch (chunks de 100), com reinício de
  execuções falhas.
- Normalização dinâmica de colunas e valores; detecção do rótulo de fraude por
  aliases configuráveis.
- Persistência em `bronze`, `silver`, `gold`, `ops`, `review` e `ml`.
- Transactional outbox para publicar transações no Kafka.
- Consumo dos resultados de scoring e gravação na Gold.
- Consultas paginadas e filtráveis de sinistros, resultados e importações.
- Revisão humana de fraude.
- Solicitação de treino e ativação de modelo (role `MODEL_ADMIN`) e consumo dos
  resultados.

## Dependências internas e externas

| Tipo | Dependência | Uso |
| --- | --- | --- |
| Externa (runtime) | PostgreSQL 16 | Persistência; schema gerido pelo Flyway |
| Externa (runtime) | Kafka | Tópicos `transactions`, `fraud-results`, `model-*` |
| Externa (runtime) | Volume/diretório `IMPORT_STORAGE_PATH` | Arquivos enviados, lidos também pelo ML |
| Biblioteca | Spring Boot 4.0.6 (Web, Data JPA, Batch, Validation, Security, Flyway), spring-kafka | Base do serviço |
| Biblioteca | Apache POI 5.5.1, Commons CSV 1.14.1 | Leitura de planilhas |
| Biblioteca | MapStruct 1.6.3, Lombok 1.18.46 | Mapeamento e entidades |
| Biblioteca | Jackson 3 (`tools.jackson`) e Jackson 2 + JSR-310 (Hibernate JSON) | Serialização (RT-15) |
| Interna | Pacotes `adapter`, `application`, `config` | Ver READMEs abaixo |

## Módulos relacionados

- [`fraud-dashboard`](../fraud-dashboard/README.md): único cliente HTTP.
- [`ml-fraud-py`](../ml-fraud-py/README.md): par assíncrono via Kafka e volume
  compartilhado.
- Submódulos internos:
  - [`application`](src/main/java/com/unip/fraud/application/README.md)
  - [`adapter/in`](src/main/java/com/unip/fraud/adapter/in/README.md) e
    [`adapter/in/batch`](src/main/java/com/unip/fraud/adapter/in/batch/README.md)
  - [`adapter/out`](src/main/java/com/unip/fraud/adapter/out/README.md)
  - [`config`](src/main/java/com/unip/fraud/config/README.md)
  - [`db/migration`](src/main/resources/db/migration/README.md)

## Pontos de entrada

| Entrada | Classe |
| --- | --- |
| Aplicação | `com.unip.fraud.FraudApplication` (`@EnableKafka`, `@EnableAsync`, `@EnableScheduling`) |
| HTTP (context path `/process_fraud_automotive`, porta 8080) | `ImportController`, `ImportInspectionController`, `ClaimController`, `DashboardController`, `ModelController` |
| Kafka | `FraudResultKafkaConsumer`, `ModelLifecycleKafkaConsumer` |
| Agendador | `TransactionOutboxPublisher.publishPending` (fixed delay `OUTBOX_PUBLISH_DELAY_MS`) |
| Job Spring Batch | `datasetImportJob` (lançado por `ImportJobLauncherAdapter`) |

## Fluxos importantes

1. **Importação:** `POST /imports` → `ImportDatasetService` → storage →
   `ops.import_job` → `datasetImportJob` → Bronze/Silver/rejeitados/outbox →
   `TransactionOutboxPublisher` → Kafka `transactions`.
2. **Resultado de scoring:** Kafka `fraud-results` →
   `FraudResultKafkaConsumer` → `gold.fraud_prediction`.
3. **Ciclo de vida de modelo:** `POST /models/train` →
   `model-training-requests` → … → `model-training-results` →
   `ModelTrainingService.finishTraining`; `POST /models/{id}/activate` →
   `model-activation-requests` → … → `finishActivation` →
   `ml.model_registry`.
4. **Revisão:** `POST /claims/{id}/reviews` → `FraudReviewService`.

Diagramas completos na seção 6 da [Arquitetura](../docs/ARQUITETURA_DO_SISTEMA.md#6-fluxo-de-comunicação-entre-módulos).

## Arquivos críticos

| Arquivo | Motivo |
| --- | --- |
| `pom.xml` | Versões e processadores de anotação (Lombok + MapStruct) |
| `src/main/resources/application.yml` | Todas as variáveis de ambiente e tópicos |
| `src/main/resources/db/migration/*.sql` | Schema completo |
| `src/main/java/com/unip/fraud/adapter/in/batch/DynamicDatasetProcessor.java` | Regras de normalização e de rótulo |
| `src/main/java/com/unip/fraud/application/service/ImportDatasetService.java` | Entrada do fluxo de análise |
| `src/main/java/com/unip/fraud/application/service/ModelTrainingService.java` | Ciclo de vida do modelo (AV-01) |
| `src/main/java/com/unip/fraud/config/security/SecurityConfig.java` | Única regra de autorização |
| `Dockerfile` | Build multi-stage (JDK 21 → JRE 21), testes pulados no build da imagem |

## Configuração

| Variável | Padrão |
| --- | --- |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | `jdbc:postgresql://localhost:5432/fraud_db` / `postgres` / `postgres` |
| `JPA_SHOW_SQL` | `false` |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` |
| `KAFKA_TRANSACTIONS_TOPIC` / `KAFKA_RESULTS_TOPIC` | `transactions` / `fraud-results` |
| `KAFKA_TRAINING_REQUESTS_TOPIC` / `KAFKA_TRAINING_RESULTS_TOPIC` | `model-training-requests` / `model-training-results` |
| `KAFKA_ACTIVATION_REQUESTS_TOPIC` / `KAFKA_ACTIVATION_RESULTS_TOPIC` | `model-activation-requests` / `model-activation-results` |
| `IMPORT_STORAGE_PATH` | `${java.io.tmpdir}/fraud-imports` |
| `IMPORT_MAX_FILE_SIZE` | `52428800` (50 MB) |
| `IMPORT_TARGET_ALIASES` | `fraudfound_p,fraud,is_fraud,fraude,isfraud,label` |
| `OUTBOX_PUBLISH_DELAY_MS` | `1000` |
| `MODEL_ADMIN_USER` / `MODEL_ADMIN_PASSWORD` | `admin` / `admin-local` |

## Executar e validar

```bash
./mvnw spring-boot:run      # requer PostgreSQL e Kafka acessíveis
./mvnw clean verify         # compila e executa os testes
```

Testes existentes (`src/test`): leitores CSV/Excel, `DynamicDatasetProcessor`,
`FraudResultKafkaConsumer`, serialização JSON do Hibernate, mappers MapStruct e
`ImportDatasetService`.

## Observações técnicas e débitos identificados

- Violações de camada: AV-01, AV-02, AV-03, AV-04.
- Código órfão: OR-01 (`ModelTrainingStatus`), OR-02 (`ClaimQueryService.NAME`),
  OR-03 (revisão sem consumidor), OR-04 (`ml.model_registry` subutilizada).
- `ARCHITECTURE.md` e `FLUXO_ANALISE.md` desta pasta estão desatualizados (OR-07).
- `.codex_tmp/build_sinistros_teste.mjs` está versionado apesar do `.gitignore`
  (OR-06).
- Riscos: RT-05 (segurança), RT-06 (outbox), RT-08 (fonte de verdade do modelo),
  RT-09 (progresso), RT-10 (revisão × score), RT-11 (busca), RT-14 (testes).
