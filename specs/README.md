# specs — Especificações do FraudGuard

> Aplicação do Spec-Driven Development no projeto, com base no
> [spec-kit](https://github.com/github/spec-kit) do GitHub. Complementa o fluxo
> da [Arquitetura §11.1](../docs/ARQUITETURA_DO_SISTEMA.md#111-fluxo-spec-driven-development).

## Como funciona

Toda mudança no sistema começa por uma spec: o que muda, para quem, como
testar e o que não pode mudar. Só depois vêm contratos, código, testes e
documentação (Arquitetura §11.1).

| Arquivo | Papel |
| --- | --- |
| [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) | Princípios que toda spec respeita, cada um apontando para a documentação oficial. |
| [`.specify/templates/spec-template.md`](../.specify/templates/spec-template.md) | Modelo de spec adaptado ao tema (fraude em sinistros automotivos). |
| [`.claude/skills/especificar/SKILL.md`](../.claude/skills/especificar/SKILL.md) | Skill do Claude Code: `/especificar <pedido>` cria a spec seguindo os dois arquivos acima. |
| `specs/NNN-nome/spec.md` | Uma pasta por funcionalidade, numerada em ordem (`001`, `002`...). |

## O que mudou em relação ao modelo original do spec-kit

- Tudo em português.
- Seção **Conformidade com o projeto**: item das
  [Regras do Projeto](../docs/REGRAS_DO_PROJETO.md) atendido, conferência do
  fora do escopo, regras R-* e débitos AV/OR/RT envolvidos.
- Seção **Situação atual**: o comportamento de hoje com o arquivo que o
  comprova (regra do [`plano.md`](../plano.md): nunca inventar comportamento).
- Atores do [Objetivo do Sistema](../docs/OBJETIVO_DO_SISTEMA.md) nas
  histórias e casos de borda do tema já listados (sem modelo ativo, modelo de
  anomalia, base sem rótulo, classe rara, linhas rejeitadas).
- Seção **Contratos afetados** (rotas, tópicos Kafka, tabelas), porque aqui o
  contrato é documentado antes do código.
- Seção **Dados e modelo**: base usada (fraud_oracle ou base sintética de
  demonstração), alvo, desbalanceamento, métricas, limiar e identificadores.
- Seção **Verificação e documentação**: comandos de teste, conferência manual,
  documentos a atualizar no mesmo commit e uso na monografia.
- Marcação de dúvida `[PRECISA ESCLARECER]`, no máximo 3 por spec.

## Ciclo de vida

| Status | Significado |
| --- | --- |
| Rascunho | Ainda há `[PRECISA ESCLARECER]` ou falta revisão do grupo. |
| Em revisão | Sem perguntas abertas; aguardando o grupo aprovar. |
| Aprovada | Pode ser implementada (Arquitetura §11.1). |
| Implementada | Código, testes e documentação no `homolog`. |
| Descartada | O grupo decidiu não fazer; manter o arquivo como registro. |

## Specs

| Nº | Funcionalidade | Status |
| --- | --- | --- |
| [001](001-graficos-dashboard/spec.md) | Gráficos do painel | Rascunho |
