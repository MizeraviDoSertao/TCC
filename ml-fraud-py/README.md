# ml-fraud-py — Serviço de Machine Learning (Python)

> Documentos globais: [Arquitetura do Sistema](../docs/ARQUITETURA_DO_SISTEMA.md) ·
> [Objetivo do Sistema](../docs/OBJETIVO_DO_SISTEMA.md). Códigos `AV-`, `OR-` e
> `RT-` referem-se à seção 10 da Arquitetura.

## Objetivo do módulo

Treinar modelos de risco de fraude e pontuar (fazer *scoring* de) sinistros
recebidos pelo Kafka, devolvendo o resultado ao backend Java.

## Responsabilidade principal

Ser o **único executor de modelos** do sistema: treino de candidatos, promoção
do candidato a modelo ativo e inferência. Não acessa o PostgreSQL; ingestão,
persistência medalhão e revisão humana são do backend (`tcc`).

## Funcionalidades existentes

- **Treino supervisionado** (há coluna de rótulo reconhecida): Random Forest
  (`n_estimators=300`, `class_weight="balanced_subsample"`,
  `min_samples_leaf=2`), holdout estratificado (`FRAUD_TEST_SIZE`, padrão 25%)
  com métricas `accuracy`, `precision`, `recall`, `f1` e `roc_auc`, seguido de
  reajuste com todas as linhas rotuladas. Exige ≥ 8 linhas rotuladas, as duas
  classes e ≥ 2 exemplos por classe. `threshold = 0,5`.
- **Treino de anomalias** (sem rótulo): Isolation Forest
  (`n_estimators=300`, `contamination = FRAUD_ANOMALY_CONTAMINATION`), com
  calibração do score pelos quantis 5% e 90% do treino; exige ≥ 8 linhas;
  `threshold = 0,7`; `predictedFraud` sempre `null`.
- **Scoring** de mensagens `transactions` com retry, commit manual e DLT.
- **Gestão de modelos** por Kafka: treino de candidatos e ativação (cópia do
  candidato para o artefato ativo).
- **Recarga automática** do modelo ativo quando o arquivo muda (`mtime`).
- **Manifesto** `*.metadata.json` para cada artefato salvo.
- CLI para treino local, consumo, serviço completo e inspeção de colunas.

## Dependências internas e externas

| Tipo | Dependência |
| --- | --- |
| Biblioteca | `pandas`, `scikit-learn`, `joblib`, `kafka-python`, `openpyxl` (XLSX), `xlrd` (XLS), `numpy` (transitiva) |
| Runtime | Python ≥ 3.11 (imagem `python:3.12-slim`) |
| Infraestrutura | Kafka; volume com os arquivos enviados pelo backend (`/data/imports`, somente leitura); volume de artefatos (`/app/artifacts`) |
| Interna | Pacote [`fraud_detection`](fraud_detection/README.md) |

## Módulos relacionados

- [`tcc`](../tcc/README.md): produz `transactions`, `model-training-requests` e
  `model-activation-requests`; consome `fraud-results`,
  `model-training-results` e `model-activation-results`; grava os datasets lidos
  no treino.
- Subpacotes: [`fraud_detection`](fraud_detection/README.md),
  [`application`](fraud_detection/application/README.md),
  [`training`](fraud_detection/training/README.md),
  [`infrastructure`](fraud_detection/infrastructure/README.md).

## Pontos de entrada

| Comando | Efeito |
| --- | --- |
| `python -m fraud_detection serve` | **Padrão do contêiner.** Thread *daemon* com `KafkaModelManagementWorker` + `KafkaScoringWorker` na thread principal. |
| `python -m fraud_detection consume` | Somente scoring. |
| `python -m fraud_detection train --dataset <arquivo> [--artifact <saída>]` | Treino local; grava direto no artefato ativo por padrão e imprime o relatório JSON. |
| `python -m fraud_detection inspect --dataset <arquivo>` | Lista colunas normalizadas e número de linhas. |
| `fraud-ml ...` | Mesmo CLI, instalado via `pyproject.toml`. |
| `consumer.py`, `train-model.py`, `consult-column.py` | Scripts de compatibilidade que delegam ao CLI (`consume`, `train`, `inspect`). |

Opção global: `--log-level` (padrão `INFO`).

## Fluxos importantes

1. **Scoring:** `transactions` → valida `transactionId` (string ≤ 64),
   `features` (objeto não vazio) e `realFraud` (bool ou nulo) → alinha as
   features às colunas do modelo (ausentes = imputadas; novas = ignoradas) →
   `fraud-results`. Após `KAFKA_MESSAGE_MAX_RETRIES` falhas (intervalo
   `KAFKA_RETRY_SECONDS`), publica em `transactions.DLT` e faz commit.
2. **Treino:** `model-training-requests {trainingId, datasetPath}` → treina →
   salva `FRAUD_CANDIDATE_DIRECTORY/{trainingId}.joblib` →
   `model-training-results` (`READY` ou `FAILED`).
3. **Ativação:** `model-activation-requests {trainingId}` → carrega o candidato →
   salva em `FRAUD_MODEL_PATH` → `model-activation-results` (`ACTIVE` ou
   `ACTIVATION_FAILED`).

Contratos completos na seção 7.2 da
[Arquitetura](../docs/ARQUITETURA_DO_SISTEMA.md#72-tópicos-kafka).

## Arquivos críticos

| Arquivo | Motivo |
| --- | --- |
| `fraud_detection/cli.py` | Composição e comandos |
| `fraud_detection/config.py` | Todas as variáveis de ambiente |
| `fraud_detection/normalization.py` | Contrato de normalização compartilhado com o Java |
| `fraud_detection/application/scoring.py` | Inferência, faixas de risco, classificação |
| `fraud_detection/infrastructure/kafka.py` | Retry, commit e DLT do scoring |
| `fraud_detection/infrastructure/model_management.py` | Treino e ativação via Kafka |
| `Dockerfile` | Copia apenas `fraud_detection/`; cria `/app/artifacts/candidates` |

## Configuração

| Variável | Padrão |
| --- | --- |
| `FRAUD_MODEL_PATH` | `artifacts/fraud_model.joblib` |
| `FRAUD_CANDIDATE_DIRECTORY` | `artifacts/candidates` |
| `FRAUD_TARGET_ALIASES` | `fraudfound_p,fraud,is_fraud,fraude,isfraud,label` |
| `FRAUD_RANDOM_STATE` | `42` |
| `FRAUD_TEST_SIZE` | `0.25` (0,05–0,5) |
| `FRAUD_ANOMALY_CONTAMINATION` | `0.05` (0,001–0,5) |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` |
| `KAFKA_TRANSACTIONS_TOPIC` / `KAFKA_RESULTS_TOPIC` | `transactions` / `fraud-results` |
| `KAFKA_CONSUMER_GROUP` | `ml-fraud-consumer` |
| `KAFKA_MESSAGE_MAX_RETRIES` | `3` (≥ 1) |
| `KAFKA_RETRY_SECONDS` | `5.0` (0,1–300) |
| `KAFKA_TRAINING_REQUESTS_TOPIC` / `KAFKA_TRAINING_RESULTS_TOPIC` | `model-training-requests` / `model-training-results` |
| `KAFKA_ACTIVATION_REQUESTS_TOPIC` / `KAFKA_ACTIVATION_RESULTS_TOPIC` | `model-activation-requests` / `model-activation-results` |
| `KAFKA_TRAINING_CONSUMER_GROUP` | `ml-model-manager` |

## Executar e validar

A partir de `ml-fraud-py/`:

```bash
python -m pip install -r requirements.txt
python -m fraud_detection train --dataset ../fraud_scenario_1.csv
python -m fraud_detection serve
python -m unittest discover -s tests -v
```

`../fraud_scenario_1.csv` é apenas um exemplo de caminho; esse arquivo não está
no repositório.

Testes (`tests/`): retry e DLT do worker Kafka, normalização (inclusive
paridade com o Java), treino supervisionado/anomalia e validação do scoring.

## Observações técnicas e débitos identificados

- AV-05: `application/scoring.py` importa `infrastructure`; composição espalhada
  entre `cli.py` e `model_management.py`.
- AV-06: aliases, rótulos, faixas de risco, normalização de nomes e tópicos
  duplicados com o Java.
- OR-06: `artifacts/candidates/*.joblib` e `.idea/` estão versionados; o
  `.gitignore` cobre apenas `artifacts/*.joblib`.
- RT-01: o treino depende do caminho absoluto enviado pelo Java.
- RT-03 (**Hipótese**): o treino lê o arquivo bruto, sem a normalização de
  valores aplicada pelo Java às transações pontuadas.
- RT-04 (**Hipótese**): colunas identificadoras viram features; o candidato
  versionado tem métricas = 1,0.
- RT-07: `transactions.DLT` não é criado explicitamente.
- RT-08: o arquivo do modelo ativo e o registro no banco podem divergir.
- RT-13: o gestor de modelos processa uma mensagem por vez, com treino síncrono.
- O `datasetHash` enviado pelo Java é ignorado (o hash é recalculado).
- `reasons` do modelo supervisionado são as features mais importantes do modelo
  inteiro, não uma explicação específica do sinistro.
