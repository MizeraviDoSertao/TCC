# src/app/claims — Tela "Sinistros"

> Parte de [`fraud-dashboard`](../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Explorar as linhas normalizadas (camada Silver) de qualquer importação,
inclusive colunas que nunca foram vistas antes.

## Responsabilidade principal

Consulta e inspeção de dados dinâmicos, sem depender de colunas fixas.

## Funcionalidades existentes

| Arquivo | Função |
| --- | --- |
| `claims.component.ts/.html/.css` | Formulário com busca textual, seletor de importação (até 100), coluna dinâmica (habilitada quando há schema) e valor; lista paginada (20 por página) com prévia dos 3 primeiros atributos; painel lateral com todos os atributos ordenados e filtráveis; link "Abrir análise da IA". Aceita `?importId=` na URL. |
| `claim.service.ts` | `list(filter, page, size)` em `/process_fraud_automotive/claims`; `schema(importId)` em `/process_fraud_automotive/imports/{id}/schema`. |
| `claim.model.ts` | `Claim` (≡ `ClaimRecord`), `DatasetColumn`, `ClaimFilter`. |

Rótulo exibido: `confirmedFraud` `true` "Fraude", `false` "Legítimo", `null`
"Sem rótulo".

## Dependências internas e externas

- **Internas:** `ImportService` e `ImportJob` de [`imports`](../imports/README.md);
  `PagedResponse` (`src/page`).
- **Externas:** `@angular/forms` (`ReactiveFormsModule`), `@angular/router`
  (`ActivatedRoute`, `RouterLink`), RxJS.

## Módulos relacionados

- [`imports`](../imports/README.md) — origem do `importId`.
- [`transaction-detail`](../transaction-detail/README.md) — destino de "Abrir
  análise da IA".
- Backend: `ClaimController` e `ImportInspectionController`
  ([adapter/in](../../../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md)).

## Pontos de entrada

Rota `/claims` (menu "Sinistros", botão do painel, link "Explorar dados").

## Fluxos importantes

1. Trocar a importação → carrega o schema → habilita o seletor de coluna.
2. Escolher coluna → habilita o campo de valor.
3. "Buscar" → `GET /claims?importId&search&field&value&page&size`.
   O backend aceita só nomes `[a-z0-9_]{1,120}` e exige valor quando há campo.

## Arquivos críticos

- `claims.component.ts` — habilitação dos controles e montagem do filtro.
- `claim.model.ts` — deve acompanhar `ClaimRecord` e `DatasetColumn` do Java.

## Observações técnicas e débitos identificados

- OR-03: não há ação de revisão humana nesta tela, embora seja o lugar natural
  para ela.
- O link "Abrir análise da IA" leva a "Análise não encontrada" se o sinistro
  ainda não tiver resultado na Gold.
- RT-11 (**Hipótese**): buscas textuais podem ficar lentas com volume alto.
- `formatLabel`/`formatValue` estão duplicados em
  [`transaction-detail`](../transaction-detail/README.md)
  (`featureLabel`/`featureValue`).
