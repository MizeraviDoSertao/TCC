---
name: especificar
description: Cria ou atualiza a especificação de uma funcionalidade do FraudGuard (Spec-Driven Development) em specs/NNN-nome/spec.md, usando o modelo adaptado do spec-kit e as regras do projeto. Use quando pedirem spec, especificação, histórias de usuário ou requisitos de algo novo no sistema.
argument-hint: <descrição da funcionalidade>
---

# /especificar

Pedido do usuário:

```text
$ARGUMENTS
```

Se o pedido estiver vazio, pergunte qual funcionalidade especificar e pare.
Para atualizar uma spec que já existe, o usuário cita o caminho ou o número
(ex.: `001`); nesse caso edite o arquivo em vez de criar outro.

Responda e escreva sempre em português.

## 1. Conferir a base

- A branch atual deve partir da `homolog` atualizada (Regras do Projeto,
  "Branch de referência"). Rode `git status` e `git log -1 --oneline`.
- Se houver mudanças não commitadas, avise o usuário e não troque de branch
  sozinho.
- Anote o commit da `homolog` usado como base; ele vai no cabeçalho da spec.

## 2. Ler antes de escrever

Leia nesta ordem e use como fonte:

1. `.specify/memory/constitution.md` (princípios I a VII)
2. `docs/REGRAS_DO_PROJETO.md` (escopo)
3. `docs/OBJETIVO_DO_SISTEMA.md` (atores e fluxos)
4. `docs/ARQUITETURA_DO_SISTEMA.md`, principalmente §3 (regras), §7
   (contratos), §8 (dados), §10 (AV/OR/RT) e §11 (diretrizes)
5. O README de cada módulo afetado
6. O código citado por esses documentos. Vale o código: se um documento
   divergir do código, descreva o código e aponte a divergência na spec.

## 3. Conferir o escopo

- Se o pedido estiver em "O que não precisa ser implementado" das Regras do
  Projeto, **não crie a spec**: diga qual linha das Regras impede e pare.
- Se o pedido não estiver em "O que ainda vamos implementar", avise que é
  escopo novo e pergunte se o grupo quer seguir. Só continue com um sim, e
  registre na seção "Conformidade com o projeto" quem aprovou e quando.

## 4. Criar o arquivo

- Nome curto de 2 a 4 palavras, em português, minúsculas, sem acento,
  separado por hífen (ex.: `graficos-dashboard`).
- Número: o próximo de 3 dígitos depois dos que existem em `specs/`
  (`001`, `002`...).
- Copie `.specify/templates/spec-template.md` para
  `specs/NNN-nome-curto/spec.md`.
- Acrescente a spec na tabela "Specs" de `specs/README.md` (número, nome e
  status). Mantenha o status dessa tabela igual ao do cabeçalho da spec.

## 5. Preencher

- Mantenha as seções e a ordem do modelo. Seção obrigatória que não se aplica
  recebe "Não se aplica" e o motivo.
- **Situação atual**: cada afirmação com o arquivo que a comprova; inferência
  marcada como **Hipótese**.
- **Histórias**: atores do Objetivo do Sistema §3, em ordem de prioridade, cada
  uma demonstrável sozinha.
- **Requisitos**: testáveis, com DEVE / NÃO DEVE, numerados RF-001 em diante.
  Inclua o que não pode mudar (ex.: o fluxo Analisar não altera o modelo
  ativo).
- **Contratos afetados**: rotas (§7.1), tópicos (§7.2) e tabelas (§8). Se
  houver mudança, a spec diz que a Arquitetura será atualizada antes do código.
- **Dados e modelo**: siga o princípio VI. Diga qual base sustenta cada
  número; nunca atribua número da base sintética ao fraud_oracle.
- **Critérios de sucesso**: mensuráveis e conferíveis na demonstração (ex.:
  consulta SQL na Gold, contagem na tela).
- No máximo 3 `[PRECISA ESCLARECER: pergunta]`, escolhidas pelo impacto
  (escopo > segurança > experiência do usuário > detalhe técnico). O resto vira
  premissa com o padrão escolhido.
- Não proponha nada da lista "O que não precisa ser implementado" nem dentro
  de outra funcionalidade (ex.: SHAP, Streamlit, SMOTE em produção).

## 6. Revisar a spec

Confira cada item e corrija o que falhar (até 3 rodadas):

- [ ] Todas as seções obrigatórias preenchidas ou com "Não se aplica"
- [ ] Comportamento atual com arquivo citado; inferências como **Hipótese**
- [ ] Nada fora do escopo das Regras do Projeto
- [ ] Regras R-* e itens AV/OR/RT relacionados citados
- [ ] Cada requisito é testável e tem cenário de aceite que o cobre
- [ ] Critérios de sucesso mensuráveis
- [ ] Casos de borda do tema considerados (sem modelo ativo, modelo de
      anomalia, base sem rótulo, classe rara, linhas rejeitadas)
- [ ] Origem dos dados clara (fraud_oracle x base sintética)
- [ ] No máximo 3 marcações `[PRECISA ESCLARECER]`

## 7. Perguntas ao usuário

Se sobrar `[PRECISA ESCLARECER]`, apresente todas de uma vez, numeradas, cada
uma com o contexto em uma linha e uma tabela:

| Opção | Resposta | Consequência |
| --- | --- | --- |
| A | ... *(recomendada)* | ... |
| B | ... | ... |
| Outra | Resposta livre | ... |

Espere a resposta (ex.: "1: A, 2: B"), troque cada marcação pela decisão,
registre-a em "Perguntas em aberto" e revise de novo.

## 8. Concluir

- Informe o caminho da spec, o status (Rascunho enquanto houver pergunta
  aberta; Em revisão quando não houver) e o que falta decidir.
- Próximo passo: implementar pela Arquitetura §11.1 (contratos, código,
  testes, documentação no mesmo commit) e abrir o PR para a `homolog` citando
  a spec.
- Não faça commit nem push sem o usuário pedir.
