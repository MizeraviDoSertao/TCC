# Especificação: Gráficos do painel

**Branch**: `001-graficos-dashboard` (criada a partir da `homolog`)

**Criada em**: 09/10/2026

**Status**: Rascunho

**Tipo**: Nova funcionalidade

**Base do código**: `homolog@0d0a9cb`

**Pedido**: "Gráficos no dashboard: distribuição por nível de risco, evolução
temporal das análises, fraudes previstas versus confirmadas, métricas do modelo
ativo, matriz de confusão no dashboard quando houver rótulos, ranking ou
distribuição por score." (Regras do Projeto, "O que ainda vamos implementar")

## Conformidade com o projeto *(obrigatória)*

- **Item das Regras do Projeto atendido**: as sete linhas de "O que ainda vamos
  implementar" em [`docs/REGRAS_DO_PROJETO.md`](../../docs/REGRAS_DO_PROJETO.md).
- **Fora do escopo conferido**: os gráficos ficam no dashboard Angular (sem
  Streamlit nem Power BI), sem SHAP, sem nginx novo e sem versionar
  `fraud-dashboard/dist/`.
- **Regras arquiteturais envolvidas**: R-FE-01 (componente coordena a tela,
  serviço faz o HTTP), R-FE-02 (prefixo `/process_fraud_automotive`), R-FE-03
  (interfaces `readonly`), R-BE-01, R-BE-02 e R-BE-03 (consulta nova passa por
  `*UseCase` e `*OutPort`).
- **Débitos que a mudança resolve, toca ou agrava**:
  - RT-16: o painel chama de "pendentes de revisão" os resultados de anomalia;
    os gráficos novos não repetem esse rótulo.
  - RT-10: uma revisão humana pode ser sobrescrita pelo score; afeta o total
    de "fraudes confirmadas". A spec não corrige, só não agrava.
  - AV-01 e AV-04: as métricas do modelo só saem por `ModelTrainingService`.
    A spec reaproveita `GET /models` e não cria dependência nova dessa classe.
  - RT-14: o frontend não tem testes; a spec não muda isso.
- **Módulos afetados**:
  [`fraud-dashboard/src/app`](../../fraud-dashboard/src/app/README.md) (painel),
  [`tcc/.../adapter/in`](../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md)
  (`DashboardController`),
  [`tcc/.../application`](../../tcc/src/main/java/com/unip/fraud/application/README.md)
  (`DashboardService`, `GoldRepositoryOutPort`) e
  [`tcc/.../adapter/out`](../../tcc/src/main/java/com/unip/fraud/adapter/out/README.md)
  (`GoldPersistenceAdapter`).

## Situação atual *(obrigatória)*

- O painel já mostra cards por camada, o percentual previsto como fraude, os
  contadores de alertas da IA, fraudes confirmadas e "pendentes de revisão", e
  a **distribuição por risco em barras** a partir de `lowRisk`, `mediumRisk` e
  `highRisk` (`fraud-dashboard/src/app/app.component.html`).
- Esses números vêm de `GET /dashboard/summary`
  (`application/domain/DashboardSummary.java`,
  `application/service/DashboardService.java`).
- `GET /dashboard/results` lista resultados paginados ordenados por
  `processedAt` decrescente, não por score
  (`adapter/out/persistence/adapter/GoldPersistenceAdapter.java`).
- `gold.fraud_prediction` já guarda `confirmed_fraud`, `predicted_fraud`,
  `risk_score`, `score_type`, `risk_level`, `threshold`, `model_version` e
  `processed_at` (`db/migration/V1__create_medallion_schemas.sql`). Não falta
  dado para nenhum gráfico.
- As métricas de treino (`accuracy`, `precision`, `recall`, `f1`, `roc_auc`)
  ficam em `ml.model_training.metrics`, são calculadas no holdout de 25% da
  base de treino (`ml-fraud-py/fraud_detection/training/supervised.py`) e só
  aparecem na tela Modelos (`fraud-dashboard/src/app/models`).
- Não existem gráfico de evolução temporal, distribuição por score, matriz de
  confusão nem comparação entre previstas e confirmadas.

## Cenários de usuário e testes *(obrigatória)*

### História 1 - Ver se o modelo acerta nos dados analisados (Prioridade: P1)

Como **analista de fraude**, quero ver a matriz de confusão e as fraudes
previstas ao lado das confirmadas para saber se os alertas do modelo merecem
confiança.

**Por que esta prioridade**: é o gráfico que liga o painel ao tema do TCC
(qualidade da detecção) e já tem consulta pronta para conferência.

**Teste independente**: subir o compose, ativar um modelo supervisionado,
analisar uma base com a coluna de fraude (por exemplo, a base sintética de
demonstração) e comparar a matriz com a consulta da seção "Verificação".

**Cenários de aceite**:

1. **Dado** um modelo supervisionado ativo e resultados com fraude confirmada,
   **quando** o analista abre o painel, **então** vê VP, FP, FN e VN da versão
   ativa, e recall e precisão calculados a partir deles.
2. **Dado** que nenhum resultado da versão ativa tem fraude confirmada,
   **quando** o analista abre o painel, **então** vê "Sem fraudes confirmadas
   para comparar" em vez de uma matriz com zeros.
3. **Dado** um modelo de anomalia ativo, **quando** o analista abre o painel,
   **então** não vê matriz nem "fraudes previstas", e lê que o score é risco
   relativo que exige revisão humana.

---

### História 2 - Ver as métricas do modelo ativo (Prioridade: P2)

Como **analista de fraude**, quero ver no painel a versão e as métricas do
modelo em uso para saber com qual modelo os alertas foram gerados.

**Por que esta prioridade**: hoje essa informação só aparece na tela Modelos,
e reaproveita uma rota que já existe.

**Teste independente**: ativar um modelo e conferir que o painel mostra os
mesmos valores da tela Modelos.

**Cenários de aceite**:

1. **Dado** um modelo ativo, **quando** o analista abre o painel, **então** vê
   versão, tipo, data de ativação e as métricas, com a legenda "medidas no
   treino (25% da base de treino)".
2. **Dado** que nenhum modelo foi ativado, **quando** o analista abre o painel,
   **então** vê "Nenhum modelo ativo" e um link para a tela Modelos.

---

### História 3 - Priorizar pelo score (Prioridade: P3)

Como **analista de fraude**, quero ver como os scores se distribuem e onde
estão os casos de risco alto para decidir o que investigar primeiro.

**Por que esta prioridade**: a distribuição por nível de risco já existe; esta
história completa a visão com o score.

**Teste independente**: analisar a base de demonstração e conferir as
contagens por faixa com SQL.

**Cenários de aceite**:

1. **Dado** resultados na Gold, **quando** o analista abre o painel, **então**
   vê a distribuição por nível de risco (LOW, MEDIUM, HIGH) com os cortes 0,3
   e 0,7 indicados.
2. **Dado** resultados na Gold, **quando** o analista abre o painel, **então**
   vê a distribuição de score descrita em RF-007.

---

### História 4 - Acompanhar a evolução das análises (Prioridade: P4)

Como **analista de fraude**, quero ver quantos sinistros foram analisados e
quantos viraram alerta ao longo do tempo para acompanhar a operação.

**Por que esta prioridade**: na demonstração as análises acontecem quase todas
no mesmo dia, então o gráfico mostra pouco; ele importa mais em uso contínuo.

**Teste independente**: fazer duas análises e conferir os dois pontos no
gráfico.

**Cenários de aceite**:

1. **Dado** análises em momentos diferentes, **quando** o analista abre o
   painel, **então** vê, em cada ponto, o total analisado e o total previsto
   como fraude, agrupados como define RF-008.

### Casos de borda

- **Nenhum modelo ativo**: a Gold pode ter dados de modelos antigos; os
  gráficos de qualidade (matriz, previstas x confirmadas) ficam vazios com a
  mensagem da História 2.
- **Modelo de anomalia ativo**: `predicted_fraud` é `null`; não há matriz nem
  "previstas" (História 1, cenário 3).
- **Gold com várias versões de modelo**: matriz e previstas x confirmadas usam
  só a versão ativa; distribuições e evolução usam toda a Gold.
- **Classe rara (~6% de fraude)**: a matriz mostra contagens absolutas além de
  percentuais, para a classe fraude não sumir.
- **Base sem rótulo**: História 1, cenário 2.
- **Importação em processamento**: os gráficos mostram o que já chegou à Gold
  e se atualizam no próximo ciclo.
- **Gold vazia**: cada gráfico mostra "Sem análises ainda".
- **15.420 resultados** (tamanho do fraud_oracle): o painel continua
  respondendo, porque a agregação é feita no backend (RF-010).

## Requisitos *(obrigatória)*

### Requisitos funcionais

- **RF-001**: O painel DEVE exibir a matriz de confusão (VP, FP, FN, VN) dos
  resultados da versão de modelo ativa que tenham `confirmed_fraud` e
  `predicted_fraud` preenchidos.
- **RF-002**: Sem resultados que atendam a RF-001, o painel DEVE exibir "Sem
  fraudes confirmadas para comparar" no lugar da matriz.
- **RF-003**: O painel DEVE exibir fraudes previstas e confirmadas lado a lado
  e, junto, recall e precisão calculados pela matriz, com a legenda "nos dados
  analisados".
- **RF-004**: O painel DEVE exibir versão, tipo, data de ativação e métricas de
  treino do modelo ativo, com a legenda "medidas no treino (25% da base de
  treino)".
- **RF-005**: Com modelo de anomalia ativo, o painel NÃO DEVE exibir matriz de
  confusão nem "fraudes previstas", e DEVE informar que o score é risco
  relativo e exige revisão humana.
- **RF-006**: O painel DEVE manter a distribuição por nível de risco que já
  existe, indicando os cortes 0,3 e 0,7.
- **RF-007**: O painel DEVE exibir a distribuição de score como
  [PRECISA ESCLARECER: histograma em faixas de 10%, ranking dos 10 maiores
  scores ou os dois?].
- **RF-008**: O painel DEVE exibir a evolução das análises agrupada por
  [PRECISA ESCLARECER: dia de processamento ou importação?], com o total
  analisado e o total previsto como fraude em cada ponto.
- **RF-009**: Os gráficos DEVEM ser atualizados junto com o resumo (a cada
  60 s e pelo botão "Sincronizar agora"), sem recarregar a página.
- **RF-010**: Os números DEVEM chegar agregados do backend; o frontend NÃO
  DEVE baixar todas as páginas de resultados para agregar.
- **RF-011**: Os gráficos NÃO DEVEM alterar dados nem o modelo ativo (somente
  leitura).

### Contratos afetados

| Tipo | Hoje | Mudança proposta |
| --- | --- | --- |
| API HTTP (Arquitetura §7.1) | `GET /dashboard/summary` e `GET /dashboard/results` | Nova rota de leitura agregada sob `/dashboard` (nome e formato definidos na implementação), com matriz da versão ativa, distribuição de score e evolução. Registrar em §7.1 antes do código. |
| API HTTP (§7.1) | `GET /models` | Sem mudança; o painel passa a consumi-la para RF-004. |
| Tópico Kafka (§7.2) | — | Nenhum. |
| Tabela ou migration (§8) | `gold.fraud_prediction`, `silver.claim`, `ml.model_training` | Nenhuma; os dados já existem. |
| Modelo TypeScript | `DashboardSummary` | Nova interface `readonly` espelhando o record Java da rota nova. |

### Entidades-chave

- **Resultado da análise** (`gold.fraud_prediction`): fonte de todos os
  gráficos. Campos usados: `confirmed_fraud`, `predicted_fraud`, `risk_score`,
  `risk_level`, `model_version`, `processed_at`.
- **Versão de modelo** (`ml.model_training`): versão ativa, tipo, métricas e
  data de ativação.
- **Sinistro** (`silver.claim`): `import_id`, necessário só se RF-008 agrupar
  por importação (a Gold não guarda a importação).

## Dados e modelo *(obrigatória se envolver treino, score, métricas ou bases)*

- **Base usada**: o painel mostra o que estiver na Gold. Na apresentação, é a
  base sintética de demonstração do grupo, e os textos dos gráficos não podem
  atribuir esses números ao fraud_oracle. As métricas do capítulo 4
  (fraud_oracle) vêm do experimento offline e não aparecem nesta tela.
- **Variável-alvo**: `confirmed_fraud`, vindo do rótulo da base importada ou
  da revisão humana.
- **Desbalanceamento**: com ~6% de fraude, a matriz mostra contagens
  absolutas e o painel não destaca acurácia como métrica principal.
- **Métricas que importam**: recall e precisão da classe fraude (RF-003);
  as métricas de treino aparecem como o serviço de ML já as calcula (RF-004).
- **Limiar de decisão**: a matriz usa `predicted_fraud` como foi gravado
  (limiar salvo em `threshold`, hoje 0,5), sem recalcular.
- **Identificadores**: não se aplica; a spec não muda as variáveis do modelo.

## Critérios de sucesso *(obrigatória)*

- **CS-001**: Com a base de demonstração analisada, VP, FP, FN e VN do painel
  são iguais aos da consulta de conferência (diferença zero).
- **CS-002**: VP + FP + FN + VN é igual ao número de resultados da versão
  ativa com rótulo e previsão.
- **CS-003**: Com modelo de anomalia ativo, nenhuma área do painel exibe
  "fraude prevista".
- **CS-004**: Todo gráfico diz de onde vêm os números ("treino do modelo
  ativo" ou "dados analisados").
- **CS-005**: A História 1 pode ser demonstrada sozinha, sem as demais.

## Premissas e hipóteses

- Os gráficos ficam na tela Painel (rota `''`), sem tela nova.
- Matriz e previstas x confirmadas consideram só a versão do modelo ativo.
- As métricas do modelo ativo são as que o treino já calcula; nenhuma métrica
  nova no serviço de ML.
- **Hipótese**: os gráficos podem ser feitos em SVG/CSS, como as barras de
  risco atuais, sem biblioteca nova. Se o grupo preferir uma biblioteca,
  registrar na Arquitetura §9.3.
- **Hipótese**: a versão ativa está entre as 50 mais recentes devolvidas por
  `GET /models` (`ModelTrainingRepository.findTop50ByOrderByRequestedAtDesc`).

## Fora desta spec

- Tela de revisão humana (OR-03).
- Correção de RT-10 e RT-16.
- Curvas ROC e PR no painel (ficam no experimento e na monografia).
- Métricas do fraud_oracle no sistema.
- Exportar gráficos.

## Verificação e documentação *(obrigatória)*

- **Testes**: `./mvnw clean verify` com teste do novo caso de uso usando fakes
  das portas (convenção da Arquitetura §4) e `npm run build`.
- **Conferência manual** (CS-001 e CS-002), trocando `<versao_ativa>`:

  ```sql
  SELECT COUNT(*) FILTER (WHERE confirmed_fraud AND predicted_fraud)         AS vp,
         COUNT(*) FILTER (WHERE NOT confirmed_fraud AND predicted_fraud)     AS fp,
         COUNT(*) FILTER (WHERE confirmed_fraud AND NOT predicted_fraud)     AS fn,
         COUNT(*) FILTER (WHERE NOT confirmed_fraud AND NOT predicted_fraud) AS vn
  FROM gold.fraud_prediction
  WHERE model_version = '<versao_ativa>'
    AND confirmed_fraud IS NOT NULL
    AND predicted_fraud IS NOT NULL;
  ```

- **Documentação a atualizar no mesmo commit**: Arquitetura §7.1 (rota nova),
  README de `fraud-dashboard/src/app`, `adapter/in` e `application`, Objetivo
  do Sistema §4.3 e §5, e a seção "O que ainda vamos implementar" das Regras
  do Projeto quando os itens forem entregues.
- **Uso na monografia**: figuras do painel no capítulo de resultados, sempre
  identificadas como base sintética de demonstração.

## Perguntas em aberto

- **P1 (RF-007)**: como mostrar o score? Opções: A) histograma em faixas de 10%
  *(recomendada: complementa a lista de resultados, que já é paginada)*,
  B) ranking dos 10 maiores scores, C) os dois.
- **P2 (RF-008)**: como agrupar a evolução? Opções: A) por importação
  *(recomendada: na demonstração tudo acontece no mesmo dia, e por dia o
  gráfico teria um ponto só)*, B) por dia de processamento.

## Histórico de alterações

| Data | Mudança | Quem pediu |
| --- | --- | --- |
| 09/10/2026 | Criação, a partir da lista "O que ainda vamos implementar" das Regras do Projeto | Pedro Lucas |
