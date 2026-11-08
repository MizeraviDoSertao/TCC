# db/migration — Schema do banco (Flyway)

> Parte de [`tcc`](../../../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../../../docs/ARQUITETURA_DO_SISTEMA.md#8-modelo-de-dados).

## Objetivo do módulo

Versionar o schema do PostgreSQL. O Flyway é o único dono do schema
(`spring.jpa.hibernate.ddl-auto: validate`, `baseline-on-migrate: true`,
`baseline-version: 0`).

## Responsabilidade principal

Criar e evoluir os schemas da arquitetura medalhão e as tabelas operacionais.

## Funcionalidades existentes

| Migration | Conteúdo |
| --- | --- |
| `V1__create_medallion_schemas.sql` | Schemas `bronze`, `silver`, `gold`, `ops`, `review`, `ml`; tabelas `ops.import_job`, `bronze.claim_raw`, `silver.claim`, `gold.fraud_prediction`, `ops.rejected_record`, `review.fraud_review`, `ml.model_registry` e índices (GIN em `original_data` e `normalized_data`). |
| `V2__create_transaction_outbox.sql` | `ops.transaction_outbox` com único `(aggregate_id, event_type)` e índice `(status, created_at)`. |
| `V3__create_dataset_schema_registry.sql` | `bronze.dataset_schema` com único `(import_id, sheet_name, original_name)`. |
| `V4__add_batch_execution_to_import_job.sql` | Coluna `ops.import_job.batch_execution_id`. |
| `V5__migrate_legacy_public_tables.sql` | Copia dados de tabelas legadas `public.bronze_transaction_raw`, `public.silver_transaction`, `public.gold_fraud_result` e `public.rejected_record`, **somente se existirem**. |
| `V6__create_model_training.sql` | `ml.model_training` e índice único parcial `uk_model_training_active` (no máximo um registro com `active = TRUE`). |

### Tabelas

| Tabela | Chave / restrições | Observação |
| --- | --- | --- |
| `ops.import_job` | `id UUID` | Status em `VARCHAR(32)`; índices por `created_at DESC` e `file_hash`. |
| `bronze.claim_raw` | `BIGSERIAL`; único `(import_id, sheet_name, row_number)` | `original_data JSONB`; `source` (`uploaded-file` ou `legacy`). |
| `bronze.dataset_schema` | `BIGSERIAL` | Tipo inferido e papel (`LABEL`/`FEATURE`) por coluna. |
| `silver.claim` | `transaction_id VARCHAR(64)` | `normalized_data JSONB`; `confirmed_fraud` nulo = desconhecido. |
| `gold.fraud_prediction` | `transaction_id VARCHAR(64)` | `risk_score`, `score_type`, `risk_level`, `threshold`, `model_version`, `reasons JSONB`; índice `risk_score DESC`. |
| `ops.rejected_record` | `BIGSERIAL` | Dado original + `error_reason`. |
| `ops.transaction_outbox` | `id UUID` | `status`, `attempts`, `last_error`, `published_at`. |
| `review.fraud_review` | `BIGSERIAL` | Histórico de decisões (`decision VARCHAR(24)`). |
| `ml.model_registry` | `model_version` | `feature_schema`, `metrics JSONB`, `threshold`, `active`. |
| `ml.model_training` | `id UUID` | Status do treino, métricas (`TEXT` com JSON), dados de ativação. |

Não há chaves estrangeiras entre as tabelas; a ligação é lógica por
`import_id` e `transaction_id`.

## Dependências internas e externas

- **Externas:** PostgreSQL 16 (JSONB, GIN, índices parciais, blocos `DO $$`),
  Flyway (`flyway-database-postgresql`).
- **Internas:** as entidades em
  [`adapter/out/persistence/entity`](../../../java/com/unip/fraud/adapter/out/README.md)
  precisam corresponder exatamente a este schema (validação na inicialização).

## Módulos relacionados

- [`adapter/out`](../../../java/com/unip/fraud/adapter/out/README.md) — entidades
  e consultas nativas.
- `application.service.ModelTrainingService` — SQL direto em `ml.model_registry`
  (AV-01).
- Tabelas `BATCH_*` do Spring Batch: criadas fora do Flyway
  (`spring.batch.jdbc.initialize-schema: always`).

## Pontos de entrada

Executadas automaticamente pelo Flyway na inicialização do backend.

## Fluxos importantes

Nova mudança de schema → novo arquivo `V<próximo>__descricao.sql` → ajustar
entidade e mapper → atualizar este README e a seção 8 da Arquitetura.

## Arquivos críticos

- `V1__create_medallion_schemas.sql` — base de todo o modelo.
- `V6__create_model_training.sql` — garantia de um único modelo ativo.

## Observações técnicas e débitos identificados

- Nunca editar migrations já aplicadas; o Flyway valida o checksum.
- OR-04: `ml.model_registry.feature_schema` e `threshold` não recebem valores
  reais.
- OR-05: V5 só tem efeito em bancos com as tabelas legadas `public.*`; ela
  repete as faixas de risco 0,7/0,3 (AV-06).
- `ml.model_training.metrics` é `TEXT`, enquanto as demais estruturas JSON usam
  `JSONB`.
- RT-11 (**Hipótese**): os índices GIN `jsonb_ops` não atendem às buscas
  `ILIKE` usadas em `/claims`.
