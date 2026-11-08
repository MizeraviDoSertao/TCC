# fraud_detection/training — Estratégias de treinamento

> Parte de [`fraud_detection`](../README.md) no [`ml-fraud-py`](../../README.md).
> Regras globais em [Arquitetura do Sistema](../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Encapsular os algoritmos de treinamento atrás do `Protocol` `TrainingStrategy`
e escolher o algoritmo conforme a presença do rótulo de fraude.

## Responsabilidade principal

Produzir um `ModelBundle` completo (pipeline treinado, colunas, threshold,
métricas e metadados) a partir de features e alvo opcionais.

## Funcionalidades existentes

| Classe | Função |
| --- | --- |
| `TrainingStrategyFactory` | `create(has_target)`: `SupervisedTrainingStrategy` se há alvo; senão `AnomalyTrainingStrategy`. |
| `SupervisedTrainingStrategy` | Remove linhas sem rótulo; valida ≥ 8 linhas, 2 classes e ≥ 2 exemplos por classe; `train_test_split` estratificado; `RandomForestClassifier(300, balanced_subsample, min_samples_leaf=2)`; métricas no holdout; reajuste com todas as linhas; `important_features` (top 5 por importância > 0); versão `supervised-rf-<UTC>`; `threshold = 0,5`. |
| `AnomalyTrainingStrategy` | Valida ≥ 8 linhas; `IsolationForest(300, contamination)`; numéricas escalonadas; calibração por quantis 5%/90% do `decision_function`; métricas `training_anomaly_rate`, `score_low_reference`, `score_high_reference`; versão `anomaly-iforest-<UTC>`; `threshold = 0,7`. |

## Dependências internas e externas

- **Internas:** `domain` (`ModelBundle`, `ModelType`), `normalization`
  (`coerce_feature_types`), `preprocessing` (`build_preprocessor`), `ports`
  (`TrainingStrategy`).
- **Externas:** `scikit-learn`, `pandas`, `numpy`.

## Módulos relacionados

- [`application`](../application/README.md) — `ModelTrainingService` usa a
  factory.
- [`fraud_detection`](../README.md) — tipos e pré-processamento.

## Pontos de entrada

`TrainingStrategyFactory(random_state, test_size, contamination).create(has_target)`
→ `strategy.train(features, target, target_column)`.

## Fluxos importantes

Supervisionado: filtrar rotulados → tipar → dividir → treinar → medir →
retreinar com tudo → `ModelBundle`. Anomalia: tipar → treinar → calibrar →
`ModelBundle`.

## Arquivos críticos

- `supervised.py` — métricas exibidas ao administrador para decidir a ativação.
- `anomaly.py` — calibração que define o score de anomalia exibido.

## Observações técnicas e débitos identificados

- RT-04 (**Hipótese**): nenhuma coluna é excluída por ser identificador; com
  IDs únicos como features categóricas, o holdout pode superestimar a
  qualidade.
- `roc_auc` só é calculado quando o holdout contém as duas classes.
- `n_jobs=-1` usa todos os núcleos do contêiner durante o treino.
- Indentação de 4 espaços (o restante do pacote usa 2).
