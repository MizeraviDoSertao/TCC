# Regras do Projeto

> Arquivo de regras definido pelo grupo (Pedro Lucas, 09/10/2026). Toda nova
> análise, especificação ou mudança de código deve considerar estes pontos.
> Complementa a [Arquitetura do Sistema](./ARQUITETURA_DO_SISTEMA.md) e o
> [Objetivo do Sistema](./OBJETIVO_DO_SISTEMA.md).
>
> - Itens de **"O que não precisa ser implementado"** não devem ser propostos
>   nem implementados.
> - Itens de **"O que ainda vamos implementar"** seguem o fluxo da seção 11.1 da
>   Arquitetura (spec, contratos, código, testes e documentação no mesmo commit).
> - Para descrever o sistema, vale o que está no código (regra do `plano.md`:
>   nunca inventar comportamento). A seção
>   [Conferência com o código](#conferência-com-o-código-da-homolog) registra
>   onde cada item foi encontrado; divergências devem ser sinalizadas ao grupo.

## Branch de referência

- Todas as análises são baseadas na branch `homolog`. Antes de analisar,
  atualizar a cópia local com `git checkout homolog` e `git pull`.
- Novas mudanças partem da `homolog`, e os pull requests apontam para ela.
- A `main` não é usada como referência de análise.

## O que implementamos por estar solicitado no MD

- Experimento com Regressão Logística, Árvore e Random Forest.
- Comparação entre SMOTE, peso de classe e nenhum balanceamento.
- Comparação entre dados brutos e tratados.
- Divisão estratificada em treino e teste.
- Remoção automática de identificadores.
- Tratamento de duplicatas e valores inválidos.
- Métricas, matriz de confusão, curvas ROC/PR e importância das variáveis.
- Seleção correta do modelo e do limiar sem usar o teste.
- Preparação genérica para CSV, XLS e XLSX.
- IA generativa por sinistro com Ollama.
- Evidências locais, persistência na Gold e exibição no dashboard.
- Fallback quando a IA generativa estiver indisponível.

## O que ainda vamos implementar

- Gráficos no dashboard.
- Distribuição por nível de risco.
- Evolução temporal das análises.
- Fraudes previstas versus confirmadas.
- Métricas do modelo ativo.
- Matriz de confusão no dashboard quando houver rótulos.
- Ranking ou distribuição por score.

## O que não precisa ser implementado

- Implementação de nginx.
- Streamlit e Power BI, pois o dashboard oficial é Angular.
- SMOTE no modelo de produção; ficará no experimento.
- Regressão Logística e Árvore em produção; serão apenas baselines.
- Treinamento diretamente pela Silver; o fluxo por upload já atende.
- Remoção manual de PolicyNumber e RepNumber; já é automática.
- SHAP nesta etapa; as evidências locais atendem à primeira versão.
- Versionamento de arquivos compilados de fraud-dashboard/dist/

A partir daqui as novas análises terão que estar ciente desses pontos do nosso
projeto.

---

## Conferência com o código da homolog

Situação em 09/10/2026, branch `homolog`, commit `a9339a6`. Atualizar esta
tabela quando o código mudar. "Experimento offline" são os scripts de avaliação
do capítulo 4 (`avaliacao.py`, `tratamento.py`, `separar_treino_teste.py`),
que ainda **não estão versionados** neste repositório.

### Itens marcados como implementados

| Item | Situação no código | Evidência |
| --- | --- | --- |
| Experimento com Regressão Logística, Árvore e Random Forest | Só no experimento offline | O serviço de ML treina apenas Random Forest e Isolation Forest (`ml-fraud-py/fraud_detection/training/`). |
| Comparação entre SMOTE, peso de classe e nenhum balanceamento | Só no experimento offline | O sistema usa apenas `class_weight="balanced_subsample"` (`training/supervised.py`); não há `imblearn` no repositório. |
| Comparação entre dados brutos e tratados | Só no experimento offline | — |
| Divisão estratificada em treino e teste | Implementado | `training/supervised.py` (`train_test_split(..., stratify=target)`); depois do holdout o modelo é reajustado com todas as linhas. |
| Remoção automática de identificadores | **Não encontrado** | Nenhuma regra exclui identificadores (RT-04). O experimento offline remove `PolicyNumber` e `RepNumber` por nome fixo. |
| Tratamento de duplicatas e valores inválidos | Parcial | Linhas inválidas vão para `ops.rejected_record`; arquivo repetido é detectado por SHA-256; colunas com nome duplicado são recusadas (`normalization.py`). Linhas duplicadas só são removidas no experimento offline. |
| Métricas, matriz de confusão, curvas ROC/PR e importância das variáveis | Parcial | O sistema calcula acurácia, precisão, recall, F1, ROC AUC e importância das variáveis. Matriz de confusão e curvas ROC/PR só no experimento offline. |
| Seleção correta do modelo e do limiar sem usar o teste | Só no experimento offline | No sistema o limiar é fixo em 0,5 (`training/supervised.py`) e não há seleção de modelo. |
| Preparação genérica para CSV, XLS e XLSX | Implementado | Backend: `DatasetReaderFactory` (CSV/Excel); ML: `PandasDatasetReader`. |
| IA generativa por sinistro com Ollama | **Não encontrado** | Nenhuma referência a Ollama ou a modelo de linguagem no código. |
| Evidências locais, persistência na Gold e exibição no dashboard | Parcial | `reasons` é gravado em `gold.fraud_prediction` e exibido no detalhe da transação, mas contém as 3 variáveis mais importantes do modelo inteiro, iguais para todo sinistro; não é evidência local. |
| Fallback quando a IA generativa estiver indisponível | **Não encontrado** | Não há IA generativa no código. |

### Itens marcados como fora do escopo

| Item | Situação no código |
| --- | --- |
| Implementação de nginx | O `fraud-dashboard/nginx.conf` já existe e é usado pelo contêiner do frontend para servir o SPA e encaminhar `/process_fraud_automotive/` ao backend (Arquitetura §1). Nada novo a implementar. |
| Streamlit e Power BI | Não existem no código. |
| SMOTE no modelo de produção | Coerente: o sistema usa peso de classe. |
| Regressão Logística e Árvore em produção | Coerente: não existem no sistema. |
| Treinamento diretamente pela Silver | Coerente: o treino é feito só por upload (`POST /models/train`). |
| Remoção manual de PolicyNumber e RepNumber | **Divergência:** a remoção não é automática no sistema (ver "Remoção automática de identificadores"). |
| SHAP | Coerente: não existe no código. |
| Versionamento de `fraud-dashboard/dist/` | **Divergência:** 16 arquivos de `fraud-dashboard/dist/` estão versionados hoje e nenhum `.gitignore` cobre essa pasta (OR-06). |
