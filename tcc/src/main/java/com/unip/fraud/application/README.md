# application — Núcleo do backend

> Parte de [`tcc`](../../../../../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Concentrar os casos de uso, o modelo de domínio e as portas (interfaces) do
backend, isolando regras de negócio de HTTP, Kafka, JPA e Spring Batch.

## Responsabilidade principal

Definir **o que** o sistema faz (portas de entrada e serviços) e **do que** ele
precisa do mundo externo (portas de saída), sem conhecer as implementações.

## Funcionalidades existentes

| Serviço | Porta(s) de entrada | Função |
| --- | --- | --- |
| `ImportDatasetService` | `ImportDatasetUseCase`, `GetImportsUseCase` | Valida upload (nome, tamanho, `.csv/.xls/.xlsx`), exige modelo ativo, armazena, deduplica por hash, cria `ImportJob` e dispara o Batch; reinicia imports `FAILED`; lista/consulta imports. |
| `ImportErrorService` | `GetImportErrorsUseCase` | Lista linhas rejeitadas de um import. |
| `ClaimQueryService` | `GetClaimsUseCase` | Consulta sinistros Silver com busca textual e filtro por coluna dinâmica (nome validado por `[a-z0-9_]{1,120}`); retorna schema do import. |
| `DashboardService` | `GetDashboardUseCase` | Agrega contadores Bronze/Silver/Gold/rejeitados, fraudes reais/previstas, risco e `pendingReview`. |
| `FraudResultService` | `GetFraudResultsUseCase`, `GetFraudResultDetailUseCase` | Filtra resultados Gold (valida `minProbability ∈ [0,1]` e `startDate ≤ endDate`); compõe detalhe Gold + Silver. |
| `FraudReviewService` | `ReviewFraudUseCase` | Registra revisão humana e atualiza `confirmedFraud` na Silver e na Gold (transacional). |
| `ModelTrainingService` | **nenhuma** (AV-01) | Solicita treino/ativação via Kafka, lista treinos, processa resultados e atualiza `ml.model_registry`. |

Domínio (`domain/`): records imutáveis (`Transaction`, `DatasetRow`,
`ProcessingOutcome`, `FraudResult`, `ImportJob`, `ClaimRecord`, filtros,
comandos e views) e enums `ImportStatus`, `ReviewDecision` (com
`confirmedFraud()`), `ModelTrainingStatus` (OR-01).

`validation/Validation.requireArgument` padroniza erros de entrada
(`IllegalArgumentException` → HTTP 400). `exception/ResourceNotFoundException`
→ HTTP 404.

## Dependências internas e externas

- **Internas permitidas:** apenas `application.*`.
- **Internas indevidas:** `ModelTrainingService` importa
  `adapter.out.kafka.ModelLifecycleKafkaProducer`,
  `adapter.out.persistence.entity.ModelTrainingEntity` e
  `adapter.out.persistence.repository.ModelTrainingRepository` (AV-01).
- **Externas:** anotações Spring (`@Service`, `@Transactional`, `@Value`);
  `ModelTrainingService` também usa `JdbcTemplate` e `tools.jackson.ObjectMapper`.

### Portas de saída e implementações

| Porta (`port/out`) | Implementação (`adapter/out`) |
| --- | --- |
| `importing/ImportFileStorageOutPort` | `storage/LocalImportFileStorageAdapter` |
| `importing/ImportJobLauncherOutPort` | `batch/ImportJobLauncherAdapter` |
| `producer/TransactionOutboxOutPort` | `persistence/adapter/TransactionOutboxPersistenceAdapter` |
| `producer/TransactionProducerOutPort` | `kafka/TransactionKafkaProducer` |
| `repository/ActiveModelRepositoryOutPort` | `persistence/adapter/ModelRegistryPersistenceAdapter` |
| `repository/BronzeRepositoryOutPort` | `persistence/adapter/BronzePersistenceAdapter` |
| `repository/ClaimQueryRepositoryOutPort` | `persistence/adapter/ClaimQueryPersistenceAdapter` |
| `repository/DatasetSchemaRepositoryOutPort` | `persistence/adapter/DatasetSchemaPersistenceAdapter` |
| `repository/FraudReviewRepositoryOutPort` | `persistence/adapter/FraudReviewPersistenceAdapter` |
| `repository/GoldRepositoryOutPort` | `persistence/adapter/GoldPersistenceAdapter` |
| `repository/ImportJobRepositoryOutPort` | `persistence/adapter/ImportJobPersistenceAdapter` |
| `repository/RejectedRecordRepositoryOutPort` | `persistence/adapter/RejectedRecordPersistenceAdapter` |
| `repository/SilverRepositoryOutPort` | `persistence/adapter/SilverPersistenceAdapter` |

## Módulos relacionados

- [`adapter/in`](../adapter/in/README.md): chama as portas de entrada (e, em
  alguns casos, as de saída diretamente — AV-03).
- [`adapter/out`](../adapter/out/README.md): implementa as portas de saída.
- [`config/batch`](../config/README.md): usa portas de saída para montar o job.

## Pontos de entrada

As interfaces em `port/in/*UseCase.java` e os métodos públicos de
`ModelTrainingService` (`requestTraining`, `requestActivation`, `list`,
`finishTraining`, `finishActivation`).

## Fluxos importantes

- **Deduplicação:** o arquivo é armazenado primeiro (para calcular o hash); se
  existir import com o mesmo hash em `QUEUED`, `PROCESSING`, `COMPLETED` ou
  `COMPLETED_WITH_WARNINGS`, o novo arquivo é descartado e o import existente é
  retornado. Imports `FAILED` podem ser reenviados.
- **Retry:** permitido só para `FAILED` com `batchExecutionId`; volta para
  `QUEUED` e chama `launcher.restart`.
- **Ativação de modelo:** `finishActivation` desativa o modelo ativo anterior
  (`saveAndFlush`, por causa do índice único parcial), marca o novo como
  `ACTIVE` e faz *upsert* em `ml.model_registry` com `active = TRUE`.

## Arquivos críticos

- `service/ImportDatasetService.java`
- `service/ModelTrainingService.java`
- `service/FraudReviewService.java`
- `domain/ProcessingOutcome.java`, `domain/Transaction.java`
- `port/out/repository/GoldRepositoryOutPort.java`

## Observações técnicas e débitos identificados

- AV-01 / AV-04: criar `ManageModelUseCase` (ou equivalentes) e portas de saída
  para o registro de treinos e para a publicação de eventos de ciclo de vida;
  mover `TrainingResult`/`ActivationResult` para `domain`.
- OR-01: `ModelTrainingStatus` existe mas os status são `String` literais.
- OR-02: constante `NAME` não utilizada em `ClaimQueryService`.
- RT-10: `FraudReviewService` não impede que um score posterior sobrescreva a
  revisão na Gold; `INCONCLUSIVE` grava `null`.
- RT-16: `pendingReview` conta `predictedFraud IS NULL`, não revisões.
- `ImportDatasetService.getImports` usa `Math.min(Math.max(...))` enquanto os
  demais serviços usam `Math.clamp` — mesmo efeito, estilos diferentes.
- RT-14: apenas `ImportDatasetService` tem teste unitário neste pacote.
