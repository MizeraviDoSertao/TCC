# adapter/out — Adaptadores de saída do backend

> Parte de [`tcc`](../../../../../../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../../../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Implementar as portas de saída do núcleo `application` usando PostgreSQL
(JPA/JDBC), Kafka, sistema de arquivos e Spring Batch.

## Responsabilidade principal

Isolar tecnologia de infraestrutura: entidades JPA, repositórios Spring Data,
mapeamento MapStruct, serialização de eventos e acesso a disco ficam aqui.

## Funcionalidades existentes

### `persistence/`

| Subpasta | Conteúdo |
| --- | --- |
| `adapter/` | Implementações das portas: `BronzePersistenceAdapter`, `SilverPersistenceAdapter`, `GoldPersistenceAdapter`, `ClaimQueryPersistenceAdapter`, `DatasetSchemaPersistenceAdapter`, `RejectedRecordPersistenceAdapter`, `ImportJobPersistenceAdapter`, `FraudReviewPersistenceAdapter`, `TransactionOutboxPersistenceAdapter`, `ModelRegistryPersistenceAdapter`. |
| `entity/` | Entidades JPA mapeadas para os schemas `bronze`, `silver`, `gold`, `ops`, `review`, `ml` (ver [migrations](../../../../../../resources/db/migration/README.md)). |
| `mapper/` | Mappers MapStruct com `PersistenceMapperConfig` (`componentModel = spring`, injeção por construtor, `unmappedTargetPolicy = ERROR`). |
| `repository/` | Interfaces Spring Data JPA, incluindo consultas nativas (`SilverTransactionRepository.findDynamic`, `TransactionOutboxRepository.findPendingForUpdate`). |
| `specification/` | `FraudResultSpecificationFactory`: compõe filtros opcionais da Gold com `Specification.and`. |

Detalhes relevantes:

- `ClaimQueryPersistenceAdapter.findSchema` agrega `bronze.dataset_schema` por
  `normalized_name` com SQL nativo via `EntityManager`.
- `SilverTransactionRepository.findDynamic` filtra por `import_id`, busca
  `ILIKE` em `normalized_data::text` e filtro por campo com
  `normalized_data ->> :field ILIKE`; o nome do campo é validado antes no
  serviço e os valores são sempre parâmetros vinculados.
- `GoldPersistenceAdapter.findByFilter` ordena por `processedAt DESC`.
- `DatasetSchemaPersistenceAdapter.register` insere a coluna na primeira vez e
  só atualiza o tipo se o registrado for `NULL`.
- `TransactionOutboxPersistenceAdapter.enqueue` ignora o evento se já existir
  `(aggregateId, "TransactionReadyForScoring")`; `findPending` limita entre 1 e
  500.
- `ModelRegistryPersistenceAdapter.hasActiveModel` usa `JdbcTemplate` em
  `ml.model_registry` (sem entidade JPA).
- `BronzeEntityMapper` fixa `source = "uploaded-file"`.

### `kafka/`

| Classe | Tópico | Payload |
| --- | --- | --- |
| `TransactionKafkaProducer` (`TransactionProducerOutPort`) | `transactions` (chave `transactionId`) | `{transactionId, realFraud, features}` |
| `ModelLifecycleKafkaProducer` (sem porta — AV-01) | `model-training-requests`, `model-activation-requests` (chave `trainingId`) | `{trainingId, datasetPath, datasetHash}` / `{trainingId}` |

Ambos enviam de forma síncrona (`get(30, SECONDS)`) e convertem falhas em
`IllegalStateException`.

### `storage/`

`LocalImportFileStorageAdapter` grava em `imports.storage-path` como
`{uuid}-{nome}`; o nome é reduzido ao *basename* e sanitizado
(`[^a-zA-Z0-9._ -] → _`), com proteção contra *path traversal*; calcula SHA-256
durante a cópia. `discard` só apaga arquivos dentro do diretório configurado.
É usado tanto por importações quanto por treinos.

### `batch/`

`ImportJobLauncherAdapter` (`@Async`) inicia `datasetImportJob` com
`JobOperator.start` e grava o `batchExecutionId`; `restart` busca a execução
anterior no `JobRepository` e chama `JobOperator.restart`. Em erro, marca o
import como `FAILED`.

## Dependências internas e externas

- **Internas:** `application.port.out.*`, `application.domain.*`,
  `application.validation.Validation`. `ModelTrainingEntity` importa
  `application.domain.ModelTrainingView` (AV-02).
- **Externas:** Spring Data JPA, Hibernate (`@JdbcTypeCode(SqlTypes.JSON)`),
  JDBC, MapStruct, Lombok, spring-kafka, Spring Batch, Jackson 3, `java.nio`.

## Módulos relacionados

- [`application`](../../application/README.md) — define as portas.
- [`config`](../../config/README.md) — `KafkaProducerConfig`,
  `HibernateJsonConfiguration`.
- [`db/migration`](../../../../../../resources/db/migration/README.md) — schema
  validado pelo Hibernate.
- [`ml-fraud-py`](../../../../../../../../../ml-fraud-py/README.md) — consome
  os tópicos produzidos aqui e lê o arquivo gravado pelo storage.

## Pontos de entrada

Somente por injeção das portas de saída nos serviços, no batch e nos
consumidores.

## Fluxos importantes

- **Outbox:** `enqueue` (no chunk do Batch) → `findPending` com
  `FOR UPDATE SKIP LOCKED` → `markPublished` ou `markFailed` (só incrementa
  `attempts`).
- **Upsert da Gold:** `save` com o mesmo `transactionId` substitui o resultado.

## Arquivos críticos

- `persistence/repository/SilverTransactionRepository.java` — consulta dinâmica.
- `persistence/repository/TransactionOutboxRepository.java` — *locking* da outbox.
- `persistence/entity/ModelTrainingEntity.java` — estados do treino (AV-02).
- `storage/LocalImportFileStorageAdapter.java` — segurança de caminho e hash.
- `batch/ImportJobLauncherAdapter.java` — execução assíncrona do job.

## Observações técnicas e débitos identificados

- AV-02: `ModelTrainingEntity.toView` e status em `String`.
- OR-04: `ml.model_registry` só responde "existe modelo ativo?".
- RT-01: o caminho absoluto gravado pelo storage é enviado ao Python.
- RT-06: `TransactionOutboxEntity.registerFailure` não muda o status nem limita
  tentativas.
- RT-10: `GoldPersistenceAdapter.save` sobrescreve `confirmed_fraud` com o
  valor da mensagem.
- RT-11 (**Hipótese**): `ILIKE` em JSONB não usa o índice GIN.
- `ImportJobPersistenceAdapter` e `TransactionOutboxPersistenceAdapter` lançam
  `IllegalStateException` quando o registro não existe (sem tratamento no
  `ApiExceptionHandler`, resultaria em HTTP 500), ao contrário dos serviços, que
  usam `ResourceNotFoundException`.
