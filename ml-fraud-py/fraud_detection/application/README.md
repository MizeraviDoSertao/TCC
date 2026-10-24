# fraud_detection/application — Serviços de treino e scoring

> Parte de [`fraud_detection`](../README.md) no [`ml-fraud-py`](../../README.md).
> Regras globais em [Arquitetura do Sistema](../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Implementar os casos de uso do serviço de ML: treinar um modelo a partir de um
dataset e pontuar uma transação com o modelo carregado.

## Responsabilidade principal

Orquestrar domínio, normalização, estratégias e portas, sem lidar com Kafka.

## Funcionalidades existentes

| Classe | Função |
| --- | --- |
| `training.ModelTrainingService` | Lê o dataset (`DatasetReader`), normaliza colunas, detecta o alvo, escolhe a estratégia (`TrainingStrategyFactory`), calcula SHA-256 do arquivo, define `model_version = <versão>-<8 primeiros caracteres do hash>`, salva (`ModelRepository`) e retorna `TrainingReport`. |
| `scoring.FraudScoringService` | Valida o pedido, prepara o frame e pontua. Supervisionado: `predict_proba`, `predictedFraud = probability ≥ threshold`, `reasons` = até 3 `important_features`. Anomalia: `decision_function` calibrado entre `anomaly_low_score` e `anomaly_high_score`, `predictedFraud = None`, `reasons` fixos de revisão humana. Score limitado a [0, 1] e arredondado a 4 casas. |
| `scoring.ReloadingFraudScoringService` | Mantém um `FraudScoringService` em cache e recarrega o `.joblib` quando o `mtime` do arquivo ativo muda (com `Lock`); sem arquivo, lança "No active fraud model...". |

Faixas de risco (`_risk_level`): `HIGH ≥ 0,7`, `MEDIUM ≥ 0,3`, senão `LOW`.
Classificação: `"Suspicious transaction"`/`"Normal transaction"` para
supervisionado; `"<Risco> anomaly risk - review required"` para anomalia.

## Dependências internas e externas

- **Internas:** `domain`, `normalization`, `ports`, `training`
  (`TrainingStrategyFactory`) e — fora da regra — `infrastructure.model_repository`
  (`JoblibModelRepository`, usado por `ReloadingFraudScoringService`, AV-05).
- **Externas:** `numpy`, `hashlib`, `threading`.

## Módulos relacionados

- [`training`](../training/README.md) — estratégias usadas no treino.
- [`infrastructure`](../infrastructure/README.md) — fornece leitor de dataset,
  repositório de modelos e os workers Kafka que chamam estes serviços.
- [`tcc`](../../../tcc/README.md) — consome o resultado (`ScoringResult.to_event()`).

## Pontos de entrada

`ModelTrainingService.train(TrainingRequest)`,
`FraudScoringService.score(ScoringRequest)`,
`ReloadingFraudScoringService.score(ScoringRequest)`.

## Fluxos importantes

- O dataset vazio, sem features ou com mais de uma coluna-alvo é rejeitado com
  `ValueError`.
- A troca de modelo em produção acontece sem reinício: a ativação substitui o
  arquivo de forma atômica e o próximo `score` detecta o novo `mtime`.

## Arquivos críticos

- `scoring.py` — contrato de saída do scoring e faixas de risco.
- `training.py` — versão e hash do modelo.

## Observações técnicas e débitos identificados

- AV-05: dependência de `infrastructure.model_repository` dentro de
  `application`.
- AV-06: faixas de risco repetidas no Java.
- `_validate` limita `transactionId` a 64 caracteres, igual às colunas
  `VARCHAR(64)` do banco; a regra não é compartilhada formalmente.
