# fraud_detection/infrastructure — Adaptadores do serviço de ML

> Parte de [`fraud_detection`](../README.md) no [`ml-fraud-py`](../../README.md).
> Regras globais em [Arquitetura do Sistema](../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Conectar o serviço de ML ao mundo externo: Kafka, arquivos de dataset e
artefatos de modelo em disco.

## Responsabilidade principal

Implementar as portas (`DatasetReader`, `ModelRepository`) e os *workers*
Kafka que recebem pedidos e publicam resultados.

## Funcionalidades existentes

| Arquivo / classe | Função |
| --- | --- |
| `dataset.PandasDatasetReader` | CSV com detecção automática de separador (`sep=None`, engine `python`); XLS/XLSX lendo **todas as abas** não vazias e concatenando-as. |
| `model_repository.JoblibModelRepository` | `save`: grava em arquivo temporário e troca com `os.replace` (atômico), depois grava o manifesto `<artefato>.metadata.json` também de forma atômica. `load`: exige arquivo existente e instância de `ModelBundle`. |
| `kafka.KafkaScoringWorker` | Consome `transactions` (commit manual, `earliest`), pontua, publica em `fraud-results` (`acks="all"`, `retries=5`) e faz commit; após `message_max_retries` falhas, publica `{source, error, topic, partition, offset}` em `<transactions>.DLT` e faz commit. Reconecta enquanto não houver broker. |
| `model_management.KafkaModelManagementWorker` | Consome `model-training-requests` e `model-activation-requests` (grupo `ml-model-manager`). Treino: gera candidato em `candidate_directory/{trainingId}.joblib` e publica resultado `READY`/`FAILED` (campos em camelCase). Ativação: carrega o candidato e salva em `artifact_path`, publicando `ACTIVE`/`ACTIVATION_FAILED`. |

## Dependências internas e externas

- **Internas:** `application` (`FraudScoringService`, `ModelTrainingService`),
  `config.Settings`, `domain`.
- **Externas:** `kafka-python`, `pandas` (+ `openpyxl`, `xlrd`), `joblib`,
  sistema de arquivos.

## Módulos relacionados

- [`application`](../application/README.md) — serviços chamados pelos workers.
- [`fraud_detection`](../README.md) — `cli.py` instancia os workers.
- [`tcc`](../../../tcc/README.md) — outra ponta de todos os tópicos e dono do
  volume de datasets.

## Pontos de entrada

`KafkaScoringWorker.run_forever()` e `KafkaModelManagementWorker.run_forever()`
(iniciados por `cli._consume` e `cli._serve`).

## Fluxos importantes

- **Retry do scoring:** a mesma mensagem é tentada até `message_max_retries`
  vezes com espera de `kafka_retry_seconds`; só depois do sucesso ou do DLT é
  feito o commit (R-ML-05).
- **Ativação:** a cópia é feita por `JoblibModelRepository.save`, então o
  `ReloadingFraudScoringService` nunca lê um arquivo parcialmente escrito.

## Arquivos críticos

- `kafka.py` — garantia de entrega do scoring.
- `model_management.py` — contrato de resultados de treino/ativação com o Java.
- `model_repository.py` — formato e atomicidade dos artefatos.

## Observações técnicas e débitos identificados

- AV-05: `KafkaModelManagementWorker` instancia `ModelTrainingService` com
  adaptadores concretos (composição fora do `cli.py`); `KafkaScoringWorker`
  declara `FraudScoringService`, mas recebe `ReloadingFraudScoringService`.
- RT-01: `datasetPath` é um caminho absoluto vindo do Java.
- RT-02: payloads montados como `dict`, sem schema; em `_train`, o resultado é
  construído com `asdict(report)` e chaves renomeadas manualmente.
- RT-07: `transactions.DLT` não é criado pelo backend.
- RT-08: a ativação só substitui o arquivo; o estado no banco depende do Java
  processar `model-activation-results`.
- RT-13: uma única thread; treino síncrono; em exceção não há commit da
  mensagem que falhou (ela só é confirmada implicitamente pelo próximo commit).
- `PandasDatasetReader` (treino) e os leitores Java (ingestão) interpretam a
  mesma planilha de forma diferente — ex.: o CSV no Java exige vírgula; no
  Python o separador é detectado (relacionado a RT-03).
