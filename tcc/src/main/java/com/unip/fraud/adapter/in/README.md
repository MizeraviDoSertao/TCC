# adapter/in — Adaptadores de entrada do backend

> Parte de [`tcc`](../../../../../../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../../../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Receber estímulos externos (HTTP, mensagens Kafka, temporizador, arquivos do
Spring Batch) e traduzi-los em chamadas ao núcleo `application`.

## Responsabilidade principal

Conversão de transporte → comando/filtro de domínio e exposição dos contratos
HTTP. Não deve conter regra de negócio (ver AV-03).

## Funcionalidades existentes

### HTTP (raiz do pacote)

| Classe | Rotas | Depende de |
| --- | --- | --- |
| `ImportController` | `POST /imports`, `GET /imports`, `GET /imports/{importId}`, `POST /imports/{importId}/retry` | `ImportDatasetUseCase`, `GetImportsUseCase` |
| `ImportInspectionController` | `GET /imports/{importId}/errors`, `GET /imports/{importId}/schema` | `GetImportErrorsUseCase`, `GetClaimsUseCase` |
| `ClaimController` | `GET /claims`, `GET /claims/{transactionId}`, `POST /claims/{transactionId}/reviews` | `GetClaimsUseCase`, `ReviewFraudUseCase` |
| `DashboardController` | `GET /dashboard/summary`, `GET /dashboard/results`, `GET /dashboard/results/{transactionId}` | `GetDashboardUseCase`, `GetFraudResultsUseCase`, `GetFraudResultDetailUseCase` |
| `ModelController` | `GET /models`, `POST /models/train`, `POST /models/{trainingId}/activate` | `ModelTrainingService` concreto (AV-04) |
| `ApiExceptionHandler` | — | Converte exceções em `ApiError {status, error, message, timestamp}` (400, 403, 404, 413) |

Uploads (`POST /imports`, `POST /models/train`) usam multipart com o campo
`file` e são convertidos em `ImportFileCommand` com um `InputStreamSource`
preguiçoso (`file::getInputStream`). `ReviewRequest` valida `decision`
obrigatório, `notes ≤ 2000` e `reviewer ≤ 120`. Respostas de upload, retry e
ativação retornam **202 Accepted**.

### Kafka (`kafka/`)

| Classe | Tópico / group id | Ação |
| --- | --- | --- |
| `FraudResultKafkaConsumer` | `fraud.kafka.results-topic` / `fraud-api` | Desserializa `FraudScoringMessage`, normaliza score (0–100 → 0–1, valida 0–1), aplica *fallbacks* de `riskLevel`, `scoreType`, `classification` e `modelVersion` e grava na Gold via `GoldRepositoryOutPort` (AV-03). |
| `ModelLifecycleKafkaConsumer` | `training-results-topic` / `fraud-api-model-training`; `activation-results-topic` / `fraud-api-model-activation` | Desserializa e delega a `ModelTrainingService.finishTraining/finishActivation` (AV-04). |
| `FraudScoringMessage` | — | Contrato de entrada do resultado de scoring. |

Erros de desserialização são relançados como `IllegalArgumentException`; o
`DefaultErrorHandler` (3 tentativas, 1 s) envia a mensagem ao `<tópico>.DLT`.

### Agendador (`scheduler/`)

`TransactionOutboxPublisher.publishPending` roda com *fixed delay*
`outbox.publish-delay-ms` (padrão 1000 ms) em uma transação: busca até 100
eventos `PENDING` (`FOR UPDATE SKIP LOCKED`), envia cada um por
`TransactionProducerOutPort` e marca `PUBLISHED` ou registra a falha.

### Batch (`batch/`)

Pipeline de leitura e normalização de datasets. Documentado em
[`batch/README.md`](batch/README.md).

## Dependências internas e externas

- **Internas:** `application.port.in.*`, `application.domain.*`,
  `application.exception.*`, `application.validation.*`; e, fora da regra,
  `application.port.out.*` (Kafka, scheduler, batch) e
  `application.service.ModelTrainingService`.
- **Externas:** Spring Web/Validation, spring-kafka, Spring Batch,
  Spring Scheduling, SLF4J, Jackson 3 (`tools.jackson`), Apache POI, Commons CSV.

## Módulos relacionados

- [`application`](../../application/README.md) — destino das chamadas.
- [`config`](../../config/README.md) — fábricas de listener Kafka, job Batch e
  segurança das rotas.
- [`fraud-dashboard`](../../../../../../../../../fraud-dashboard/README.md) —
  consumidor das rotas HTTP.
- [`ml-fraud-py`](../../../../../../../../../ml-fraud-py/README.md) — produtor
  dos tópicos consumidos aqui.

## Pontos de entrada

Controllers REST, métodos `@KafkaListener` e o método `@Scheduled`.

## Fluxos importantes

- Rotas de upload → serviço de aplicação → 202 com a view do recurso criado
  (processamento continua de forma assíncrona).
- `fraud-results` → Gold: o `upsert` por `transactionId` (`JpaRepository.save`)
  permite reprocessar o mesmo resultado sem duplicar.

## Arquivos críticos

- `ApiExceptionHandler.java` — contrato de erro de toda a API.
- `kafka/FraudResultKafkaConsumer.java` — único ponto de escrita da Gold
  a partir do modelo.
- `scheduler/TransactionOutboxPublisher.java` — garantia de entrega ao Kafka.

## Observações técnicas e débitos identificados

- AV-03: `FraudResultKafkaConsumer`, `TransactionOutboxPublisher` e o batch
  usam portas de saída diretamente; as regras de *fallback* de score estão no
  adaptador.
- AV-04: `ModelController` e `ModelLifecycleKafkaConsumer` dependem do serviço
  concreto.
- AV-06: faixas de risco 0,7/0,3 duplicadas com o Python.
- OR-03: `GET /imports/{id}`, `GET /claims/{id}` e `POST /claims/{id}/reviews`
  não são usados pelo frontend.
- OR-05: `FraudScoringMessage.riskScore`, escala 0–100 e `legacy-model`.
- RT-05: apenas `POST /models/**` é protegido.
- RT-06: outbox sem limite de tentativas e com transação longa.
- `FraudResultKafkaConsumer` registra em nível INFO a mensagem completa
  recebida (inclui o texto `topic fraud-results` fixo no log, mesmo se o tópico
  for reconfigurado).
