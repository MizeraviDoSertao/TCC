# Especificação: [NOME DA FUNCIONALIDADE]

**Branch**: `[nome-da-branch]` (criada a partir da `homolog`)

**Criada em**: [DD/MM/AAAA]

**Status**: Rascunho <!-- Rascunho → Em revisão → Aprovada → Implementada (ou Descartada) -->

**Tipo**: [Nova funcionalidade | Alteração | Correção] <!-- Alteração muda algo que já existe; Correção resolve um item AV/OR/RT ou um defeito -->

**Base do código**: `homolog@[commit]`

**Pedido**: "[descrição original, nas palavras de quem pediu]"

<!--
  Modelo adaptado do spec-template.md do spec-kit (github/spec-kit) para o
  FraudGuard, sistema de detecção de fraude em sinistros de seguro automotivo.

  Antes de escrever:
  - Leia .specify/memory/constitution.md e docs/REGRAS_DO_PROJETO.md.
  - Vale o código: descreva o comportamento atual citando o arquivo; toda
    inferência é marcada como **Hipótese**.
  - Seções "(obrigatória)" não podem ser apagadas. Se não se aplicarem,
    escreva "Não se aplica" e o motivo.
  - Use no máximo 3 marcações [PRECISA ESCLARECER: pergunta]. O que puder ser
    decidido por um padrão razoável vira Premissa.
  - Apague estes comentários quando a spec estiver pronta.
-->

## Conformidade com o projeto *(obrigatória)*

<!--
  Equivale à "verificação da constituição" do spec-kit, feita já na spec.
-->

- **Item das Regras do Projeto atendido**: [linha de "O que ainda vamos
  implementar" em `docs/REGRAS_DO_PROJETO.md`]
- **Fora do escopo conferido**: [confirmar que nenhum item de "O que não
  precisa ser implementado" é proposto]
- **Regras arquiteturais envolvidas**: [R-BE-xx, R-ML-xx, R-FE-xx, R-INT-xx da
  Arquitetura §3]
- **Débitos que a mudança resolve, toca ou agrava**: [AV-xx, OR-xx, RT-xx da
  Arquitetura §10, uma linha cada]
- **Módulos afetados**: [pasta e link para o README do módulo]

## Situação atual *(obrigatória)*

<!--
  O que o sistema faz hoje sobre este assunto, com o arquivo (e o método,
  quando ajudar) que comprova. Sem isso não dá para saber o que muda.
-->

- [comportamento atual] (`caminho/do/arquivo`)

## Cenários de usuário e testes *(obrigatória)*

<!--
  Histórias em ordem de prioridade (P1 é a mais importante). Cada uma deve
  poder ser implementada, testada e demonstrada sozinha: se só a P1 ficar
  pronta, ela já entrega algo apresentável.

  Atores do FraudGuard (Objetivo do Sistema §3): Analista de sinistros/fraude,
  Administrador de modelos, Revisor humano, Serviço de ML e Operador de
  infraestrutura.
-->

### História 1 - [Título curto] (Prioridade: P1)

Como **[ator]**, quero **[ação]** para **[benefício na investigação de
sinistros]**.

**Por que esta prioridade**: [valor e motivo]

**Teste independente**: [como demonstrar só esta história, por exemplo:
"subir o compose, ativar um modelo, analisar a base de demonstração e conferir
X no painel"]

**Cenários de aceite**:

1. **Dado** [estado inicial], **quando** [ação], **então** [resultado esperado]
2. **Dado** [estado inicial], **quando** [ação], **então** [resultado esperado]

---

### História 2 - [Título curto] (Prioridade: P2)

Como **[ator]**, quero **[ação]** para **[benefício]**.

**Por que esta prioridade**: [valor e motivo]

**Teste independente**: [como demonstrar só esta história]

**Cenários de aceite**:

1. **Dado** [estado inicial], **quando** [ação], **então** [resultado esperado]

---

[Acrescente outras histórias, cada uma com prioridade]

### Casos de borda

<!--
  Situações comuns no FraudGuard. Mantenha as que se aplicam, diga o que o
  sistema deve fazer em cada uma e acrescente outras.
-->

- Nenhum modelo ativo: o backend recusa importações.
- Modelo ativo de anomalia (Isolation Forest): `predictedFraud` é `null` e
  nada pode afirmar fraude.
- Base sem coluna de rótulo (`fraudfound_p` e aliases): não há fraude
  confirmada para comparar.
- Classe rara: cerca de 6% de fraude no fraud_oracle; nada pode esconder a
  classe minoritária.
- Importação com linhas rejeitadas (`ops.rejected_record`) ou ainda em
  processamento.
- Revisão humana registrada antes do score (RT-10).
- Volume zero (Gold vazia) e volume alto (15.420 linhas, o tamanho do
  fraud_oracle).

## Requisitos *(obrigatória)*

### Requisitos funcionais

<!--
  Cada requisito é testável. Use DEVE / NÃO DEVE. Comportamento que não pode
  mudar também é requisito.
-->

- **RF-001**: O sistema DEVE [capacidade específica e testável]
- **RF-002**: O [ator] DEVE poder [interação]
- **RF-003**: O sistema NÃO DEVE [restrição, por exemplo, alterar o modelo
  ativo no fluxo Analisar]

*Exemplo de requisito em aberto:*

- **RF-004**: O painel DEVE agrupar as análises por [PRECISA ESCLARECER: dia,
  semana ou importação?]

### Contratos afetados

<!--
  Arquitetura §11.1, passo 2: o contrato muda na documentação antes do código.
  Escreva "Nenhum" na coluna quando não houver mudança.
-->

| Tipo | Hoje | Mudança proposta |
| --- | --- | --- |
| API HTTP (Arquitetura §7.1) | [rota atual ou "—"] | [rota nova ou alterada, parâmetros e resposta] |
| Tópico Kafka (§7.2) | | |
| Tabela ou migration (§8) | | [nova migration `V<n>__*.sql`; nunca editar migration aplicada (R-BE-04)] |
| Modelo TypeScript | | [interface `readonly` espelhando o record Java (R-FE-03)] |

### Entidades-chave *(se envolver dados)*

<!-- Use os nomes que já existem no sistema. -->

- **Importação** (`ops.import_job`): [o que importa para esta spec]
- **Sinistro** (`silver.claim`, atributos em JSONB): [...]
- **Resultado da análise** (`gold.fraud_prediction`: score, nível de risco,
  previsão, fraude confirmada, versão do modelo, data): [...]
- **Versão de modelo** (`ml.model_training`: tipo, métricas, status,
  ativação): [...]
- **Revisão humana** (`review.fraud_review`): [...]

## Dados e modelo *(obrigatória se envolver treino, score, métricas ou bases)*

<!--
  Constituição, princípio VI: o fraud_oracle original é a base de avaliação dos
  modelos (capítulo 4); a base sintética do grupo demonstra o sistema e é
  declarada como sintética. Nunca apresentar número da sintética como se
  viesse do fraud_oracle.
-->

- **Base usada**: [fraud_oracle original | base sintética de demonstração |
  arquivo enviado pelo usuário]
- **Variável-alvo**: [`FraudFound_P` ou alias reconhecido; "sem rótulo" no
  caso de anomalia]
- **Desbalanceamento**: [como a spec trata a classe rara; no sistema vale peso
  de classe, SMOTE só no experimento]
- **Métricas que importam**: [recall, precisão e F1 da classe fraude, ROC
  AUC...; acurácia sozinha não serve com ~6% de fraude]
- **Limiar de decisão**: [hoje fixo em 0,5 em
  `ml-fraud-py/fraud_detection/training/supervised.py`; dizer se a spec depende
  dele]
- **Identificadores**: [colunas que não podem virar variável, como
  `PolicyNumber` e `RepNumber` (RT-04)]

## Critérios de sucesso *(obrigatória)*

<!--
  Mensuráveis e conferíveis na demonstração ou na banca, sem depender de como
  foi implementado.
-->

- **CS-001**: [ex.: "os totais exibidos batem com a consulta SQL de
  conferência na Gold"]
- **CS-002**: [ex.: "um avaliador encontra os sinistros de risco alto sem
  abrir outra tela"]
- **CS-003**: [ex.: "todo número exibido diz de qual base veio"]

## Premissas e hipóteses

- [Premissa: padrão escolhido quando o pedido não disse]
- **Hipótese**: [inferência ainda não confirmada no código]

## Fora desta spec

- [o que fica de fora, inclusive itens das Regras do Projeto que não entram
  aqui]

## Verificação e documentação *(obrigatória)*

<!-- Arquitetura §11.1, passos 4 e 5. -->

- **Testes**: [`./mvnw clean verify` (tcc), `python -m unittest discover -s
  tests -v` (ml-fraud-py), `npm run build` (fraud-dashboard)] e [teste novo
  previsto]
- **Conferência manual**: [consulta SQL ou roteiro de demonstração]
- **Documentação a atualizar no mesmo commit**: [README do módulo, seções da
  Arquitetura, Objetivo do Sistema, conferência das Regras do Projeto]
- **Uso na monografia**: [seção, figura ou tabela que usa o resultado, se
  houver]

## Perguntas em aberto

<!--
  Uma linha por [PRECISA ESCLARECER] do texto, com opções e a recomendada.
  Quando todas forem respondidas, a seção fica "Nenhuma" e o status pode ir
  para Aprovada.
-->

- **P1**: [pergunta] — opções: A) [...] *(recomendada)*, B) [...], C) [...]

## Histórico de alterações

<!--
  Uma linha por versão da spec. Requisito removido fica riscado
  (~~RF-004~~) com o motivo, para o número não ser reaproveitado.
-->

| Data | Mudança | Quem pediu |
| --- | --- | --- |
| [DD/MM/AAAA] | Criação | [nome] |
