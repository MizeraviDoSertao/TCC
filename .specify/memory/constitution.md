# Constituição do FraudGuard

> Princípios que toda especificação (`specs/NNN-*/spec.md`) precisa respeitar.
> É o equivalente ao `constitution.md` do
> [spec-kit](https://github.com/github/spec-kit), adaptado ao TCC.
>
> Este arquivo **não substitui** a documentação oficial: cada princípio aponta
> para a fonte. Em caso de conflito, valem
> [Regras do Projeto](../../docs/REGRAS_DO_PROJETO.md),
> [Arquitetura do Sistema](../../docs/ARQUITETURA_DO_SISTEMA.md) e
> [Objetivo do Sistema](../../docs/OBJETIVO_DO_SISTEMA.md), e este arquivo deve
> ser corrigido.

## Princípios

### I. O código é a fonte de verdade

Uma spec descreve o comportamento atual com base no código da `homolog`,
citando o arquivo. Nada é inventado; toda inferência é marcada como
**Hipótese**. Fonte: [`plano.md`](../../plano.md), regras importantes.

### II. Escopo fechado pelas Regras do Projeto

Só entram specs para itens de "O que ainda vamos implementar". Itens de "O que
não precisa ser implementado" não são propostos. Escopo novo só depois que o
grupo o acrescentar às Regras. Fonte:
[Regras do Projeto](../../docs/REGRAS_DO_PROJETO.md).

### III. Regras arquiteturais valem para toda spec

A spec indica quais regras R-BE, R-ML, R-FE e R-INT a mudança toca e não pode
exigir que alguma seja violada. Também indica os itens AV, OR e RT que resolve,
toca ou agrava. Fonte: Arquitetura §3 e §10.

### IV. Contrato antes do código

Mudança de rota HTTP, tópico Kafka ou tabela é descrita na spec e documentada
na Arquitetura (§7 e §8) antes da implementação. Fonte: Arquitetura §11.1,
passo 2.

### V. Documentação no mesmo commit

Código, testes, README do módulo e Arquitetura mudam juntos. Fonte:
Arquitetura §11.1, passos 4 e 5.

### VI. Dados honestos

- A base **fraud_oracle** original é usada na avaliação dos modelos
  (capítulo 4 da monografia).
- A **base sintética** criada pelo grupo, inspirada no fraud_oracle, serve para
  demonstrar o sistema ponta a ponta e é sempre identificada como sintética.
- Nenhuma spec, tela ou texto apresenta número da base sintética como se viesse
  do fraud_oracle.
- Com cerca de 6% de fraude, a acurácia sozinha não mede o modelo; specs que
  tratam de métricas priorizam a classe fraude (recall, precisão, F1).
- No sistema vale o peso de classe; SMOTE, Regressão Logística e Árvore ficam
  no experimento (Regras do Projeto).

Fonte: decisão do grupo de 06/10/2026 sobre as bases.

### VII. Decisão assistida, não automática

O score orienta a investigação; quem confirma fraude é uma pessoa. Modelo de
anomalia nunca afirma fraude. O fluxo "Analisar" nunca altera o modelo ativo.
Fonte: Objetivo do Sistema §6 e Arquitetura §1.2.

## Fluxo de trabalho

1. Partir da `homolog` atualizada (Regras do Projeto, "Branch de referência").
2. Escrever a spec com `/especificar <pedido>` no Claude Code, ou copiando
   [`.specify/templates/spec-template.md`](../templates/spec-template.md) para
   `specs/NNN-nome/spec.md`.
3. Resolver as marcações `[PRECISA ESCLARECER]` com o grupo e mudar o status
   para **Aprovada**.
4. Implementar seguindo a Arquitetura §11.1 (no Claude Code,
   `/especificar implementar NNN`) e abrir o pull request para a `homolog`
   citando a spec.
5. Ao terminar, mudar o status da spec para **Implementada**.
6. Mudanças futuras na mesma funcionalidade alteram a spec existente
   (`/especificar NNN <alteração>`) e ficam no "Histórico de alterações".

## Governança

- Alterar este arquivo exige pull request para a `homolog` revisado pelo grupo.
- Se um princípio mudar na documentação oficial, este arquivo é atualizado no
  mesmo commit.

**Versão**: 1.0.0 | **Proposta em**: 09/10/2026
