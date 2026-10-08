# fraud_detection — Pacote principal do serviço de ML

> Parte de [`ml-fraud-py`](../README.md). Regras globais em
> [Arquitetura do Sistema](../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Reunir o núcleo do serviço de ML: modelo de domínio, portas, configuração,
normalização de dados, pré-processamento e o ponto de entrada de linha de
comando.

## Responsabilidade principal

Definir os tipos e contratos compartilhados pelos subpacotes `application`,
`training` e `infrastructure`, e compor a aplicação no `cli.py`.

## Funcionalidades existentes

| Arquivo | Conteúdo |
| --- | --- |
| `__init__.py` | Exporta `FraudScoringService` e `ModelTrainingService`. |
| `__main__.py` | Permite `python -m fraud_detection`. |
| `cli.py` | `argparse` com `train`, `consume`, `serve`, `inspect`; monta serviços e adaptadores. |
| `config.py` | `Settings` imutável, lido de variáveis de ambiente com validação de faixas; `DEFAULT_TARGET_ALIASES`. |
| `domain.py` | `ModelType` (`SUPERVISED`, `ANOMALY`), `TrainingRequest`, `TrainingReport`, `ModelBundle` (pipeline + colunas + threshold + métricas + calibração), `ScoringRequest`, `ScoringResult.to_event()` (camelCase). |
| `ports.py` | `Protocol`s `DatasetReader`, `ModelRepository`, `TrainingStrategy`. |
| `normalization.py` | `normalize_name` (contrato com o Java), `normalize_frame_columns`, `normalize_feature_mapping`, `find_target_column`, `parse_binary_target`, `coerce_feature_types`, `align_features`, `prepare_inference_frame`. |
| `preprocessing.py` | `build_preprocessor`: numéricas → imputação por mediana (+ `StandardScaler` opcional); categóricas → moda + `OneHotEncoder(handle_unknown="ignore")`. |

### Regras de tipagem (`coerce_feature_types`)

- Coluna totalmente vazia é descartada.
- Booleanos → categóricos.
- Numérica se o dtype já for numérico **ou** se ≥ 95% dos valores não nulos
  forem convertíveis por `pd.to_numeric`; caso contrário, categórica.
- `±inf` → `NaN`.

## Dependências internas e externas

- **Internas:** `cli.py` depende de `application`, `infrastructure` e
  `normalization`; `domain`, `ports`, `normalization` e `preprocessing` não
  dependem de `infrastructure`.
- **Externas:** `pandas`, `numpy`, `scikit-learn`.

## Módulos relacionados

- [`application`](application/README.md) — serviços de treino e scoring.
- [`training`](training/README.md) — estratégias de treinamento.
- [`infrastructure`](infrastructure/README.md) — Kafka, leitura de datasets e
  artefatos.
- Java: `DynamicDatasetProcessor.normalizeName` (mesmo algoritmo de
  `normalize_name`, R-INT-02).

## Pontos de entrada

`cli.main(arguments)`, chamado por `__main__.py`, pelo script `fraud-ml`
(`pyproject.toml`) e pelos scripts de compatibilidade da raiz do serviço.

## Fluxos importantes

- **Treino:** `normalize_frame_columns` → `find_target_column` →
  `parse_binary_target` → estratégia → `coerce_feature_types` →
  `build_preprocessor`.
- **Inferência:** `prepare_inference_frame` normaliza as chaves recebidas,
  alinha às `feature_columns` do modelo e converte os tipos conforme o
  `ModelBundle`.

## Arquivos críticos

- `normalization.py` — qualquer mudança afeta treino, inferência e a paridade
  com o Java.
- `domain.py` — `ModelBundle` é o formato serializado em `.joblib`; alterá-lo
  pode invalidar artefatos existentes (`JoblibModelRepository.load` rejeita
  tipos diferentes).

## Observações técnicas e débitos identificados

- AV-06: `DEFAULT_TARGET_ALIASES` e o vocabulário de `parse_binary_target`
  duplicam regras do Java.
- RT-03 (**Hipótese**): `coerce_feature_types` trata datas lidas pelo pandas
  como numéricas no treino, enquanto a inferência recebe datas como texto ISO
  (normalizadas pelo Java), que viram `NaN`.
- RT-04 (**Hipótese**): não há exclusão de colunas identificadoras.
- Estilo misto de indentação (2 espaços aqui; 4 em `training/` e em
  `infrastructure/model_repository.py`).
