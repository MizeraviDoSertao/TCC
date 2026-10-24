---
name: especificar
description: Spec-Driven Development no FraudGuard. Cria a spec de uma funcionalidade nova, registra alterações e correções em specs existentes e implementa uma spec aprovada pelo fluxo da Arquitetura §11.1. Use quando pedirem spec, especificação, requisitos, uma mudança no sistema ou a implementação de uma spec.
argument-hint: <pedido> | <NNN> <alteração> | implementar <NNN>
---

# /especificar

Pedido do usuário:

```text
$ARGUMENTS
```

Responda e escreva sempre em português. Se o pedido estiver vazio, pergunte o
que especificar e pare.

## Escolher o modo

| O pedido | Modo |
| --- | --- |
| Começa com `implementar` e um número (ex.: `implementar 001`) | **C. Implementar spec aprovada** |
| Começa com o número de uma spec (ex.: `001 trocar o histograma por ranking`) | **B. Alterar spec existente** |
| Muda, corrige ou remove algo que já existe no sistema, ou resolve um item AV/OR/RT | **B** se alguma spec em `specs/` já cobre o assunto; senão **A** com tipo "Alteração" ou "Correção" |
| Qualquer outra coisa | **A. Nova spec** |

Na dúvida entre A e B, procure em `specs/` (títulos e "Situação atual") e
pergunte ao usuário qual spec ele quer mudar.

## 1. Conferir a base (todos os modos)

- A branch atual deve partir da `homolog` atualizada (Regras do Projeto,
  "Branch de referência"). Rode `git status` e `git log -1 --oneline`.
- Se houver mudanças não commitadas, avise o usuário e não troque de branch
  sozinho.
- Anote o commit da `homolog` usado como base.

## 2. Ler antes de escrever (todos os modos)

Leia nesta ordem e use como fonte:

1. `.specify/memory/constitution.md` (princípios I a VII)
2. `docs/REGRAS_DO_PROJETO.md` (escopo)
3. `docs/OBJETIVO_DO_SISTEMA.md` (atores e fluxos)
4. `docs/ARQUITETURA_DO_SISTEMA.md`, principalmente §3 (regras), §7
   (contratos), §8 (dados), §10 (AV/OR/RT) e §11 (diretrizes)
5. O README de cada módulo afetado
6. O código citado por esses documentos. Vale o código: se um documento
   divergir do código, descreva o código e aponte a divergência.

## 3. Conferir o escopo (modos A e B)

- Se o pedido estiver em "O que não precisa ser implementado" das Regras do
  Projeto, **pare**: diga qual linha das Regras impede.
- Se não estiver em "O que ainda vamos implementar" nem for correção de um
  item AV/OR/RT, avise que é escopo novo e pergunte se o grupo quer seguir.
  Só continue com um sim, e registre em "Conformidade com o projeto" quem
  aprovou e quando.

## Modo A. Nova spec

1. Nome curto de 2 a 4 palavras, em português, minúsculas, sem acento,
   separado por hífen (ex.: `graficos-dashboard`). Número: o próximo de 3
   dígitos depois dos que existem em `specs/`.
2. Copie `.specify/templates/spec-template.md` para
   `specs/NNN-nome-curto/spec.md` e preencha o cabeçalho, inclusive o
   **Tipo** (Nova funcionalidade, Alteração ou Correção).
3. Preencha seguindo "Regras de preenchimento" abaixo.
4. Acrescente a spec na tabela "Specs" de `specs/README.md`.
5. Siga para "Revisar" e "Perguntas".

## Modo B. Alterar spec existente

1. Abra a spec e leia o "Histórico de alterações".
2. Atualize só as seções afetadas pela mudança, mantendo os números de RF e
   CS existentes. Requisito removido fica riscado (`~~RF-004~~`) com o motivo,
   para não reaproveitar o número.
3. Atualize "Situação atual" se o código mudou desde a última versão.
4. Acrescente uma linha no "Histórico de alterações" (data, o que mudou, quem
   pediu).
5. Se a spec estava **Aprovada** ou **Implementada** e a mudança altera
   requisito, contrato ou critério de sucesso, volte o status para
   **Em revisão** (ou **Rascunho**, se surgir pergunta aberta) e atualize a
   tabela de `specs/README.md`.
6. Siga para "Revisar" e "Perguntas".

## Modo C. Implementar spec aprovada

Segue a Arquitetura §11.1.

1. Abra `specs/NNN-*/spec.md`. Se o status não for **Aprovada** ou ainda
   houver `[PRECISA ESCLARECER]`, pare e diga o que falta decidir.
2. Se a árvore estiver limpa, crie a branch `NNN-nome-curto` a partir da
   `homolog` atualizada; se não estiver, pergunte antes.
3. **Contratos primeiro:** registre na Arquitetura (§7.1, §7.2, §8) o que a
   seção "Contratos afetados" muda, antes do código.
4. **Implemente** respeitando as regras R-* (§3) e as diretrizes do módulo
   (§11.2 a §11.5), na ordem das histórias (P1 primeiro, de modo que cada
   uma funcione sozinha).
5. **Teste** os módulos tocados: `./mvnw clean verify` (tcc),
   `python -m unittest discover -s tests -v` (ml-fraud-py),
   `npm run build` (fraud-dashboard). Rode também a conferência manual da
   seção "Verificação e documentação" da spec, quando der.
6. **Documente no mesmo commit:** README de cada módulo tocado, Arquitetura
   (§10 quando resolver ou criar item AV/OR/RT), Objetivo do Sistema e a
   "Conferência com o código" das Regras do Projeto. Mover um item entre as
   listas das Regras só com o ok do grupo.
7. Mude o status da spec para **Implementada**, registre no "Histórico de
   alterações" e atualize `specs/README.md`.
8. Mostre o que foi feito e o resultado dos testes. Não faça commit, push nem
   PR sem o usuário pedir; quando ele pedir, o PR aponta para a `homolog` e
   cita a spec.

## Regras de preenchimento (modos A e B)

- Mantenha as seções e a ordem do modelo. Seção obrigatória que não se aplica
  recebe "Não se aplica" e o motivo.
- **Situação atual**: cada afirmação com o arquivo que a comprova; inferência
  marcada como **Hipótese**. Em alteração e correção, esta seção é a mais
  importante: diga exatamente o que o sistema faz hoje.
- **Histórias**: atores do Objetivo do Sistema §3, em ordem de prioridade, cada
  uma demonstrável sozinha.
- **Requisitos**: testáveis, com DEVE / NÃO DEVE, numerados RF-001 em diante.
  Inclua o que não pode mudar (ex.: o fluxo Analisar não altera o modelo
  ativo).
- **Contratos afetados**: rotas (§7.1), tópicos (§7.2) e tabelas (§8).
- **Dados e modelo**: siga o princípio VI. Diga qual base sustenta cada
  número; nunca atribua número da base sintética ao fraud_oracle.
- **Critérios de sucesso**: mensuráveis e conferíveis na demonstração (ex.:
  consulta SQL na Gold, contagem na tela).
- No máximo 3 `[PRECISA ESCLARECER: pergunta]`, escolhidas pelo impacto
  (escopo > segurança > experiência do usuário > detalhe técnico). O resto vira
  premissa com o padrão escolhido.
- Não proponha nada da lista "O que não precisa ser implementado", nem dentro
  de outra funcionalidade (ex.: SHAP, Streamlit, SMOTE em produção).

## Revisar (modos A e B)

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
- [ ] Histórico de alterações e tabela de `specs/README.md` atualizados

## Perguntas (modos A e B)

Se sobrar `[PRECISA ESCLARECER]`, apresente todas de uma vez, numeradas, cada
uma com o contexto em uma linha e uma tabela:

| Opção | Resposta | Consequência |
| --- | --- | --- |
| A | ... *(recomendada)* | ... |
| B | ... | ... |
| Outra | Resposta livre | ... |

Espere a resposta (ex.: "1: A, 2: B"), troque cada marcação pela decisão,
registre-a em "Perguntas em aberto" e revise de novo.

## Concluir (modos A e B)

- Informe o caminho da spec, o status (Rascunho enquanto houver pergunta
  aberta; Em revisão quando não houver) e o que falta decidir.
- Quando o grupo aprovar, o status vira **Aprovada** e o próximo passo é
  `/especificar implementar NNN`.
- Não faça commit nem push sem o usuário pedir.
