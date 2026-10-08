# src/app — Shell, painel e modelos compartilhados

> Parte de [`fraud-dashboard`](../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Conter a estrutura da aplicação (shell e rotas), a tela de **Painel** e os
tipos/serviços do dashboard usados por mais de uma tela.

## Responsabilidade principal

Navegação global e visão consolidada dos resultados do modelo (camada Gold).

## Funcionalidades existentes

| Arquivo | Função |
| --- | --- |
| `root.component.ts` | Shell com *skip link*, marca, menu (`Painel`, `Analisar`, `Sinistros`, `Modelos`), indicador de ambiente fixo e rodapé. Template e estilos inline no arquivo. |
| `app.routes.ts` | Rotas `''`, `claims`, `imports`, `models`, `transactions/:transactionId` com `loadComponent`; `**` → `''`. |
| `app.component.ts/.html/.css` | Painel (`AppComponent`, seletor `app-dashboard`): resumo com polling de 60 s, cards por camada, percentual previsto como fraude, barras de risco, tabela de resultados com filtros reativos e paginação (10 por página). |
| `dashboard.service.ts` | `getSummary()`, `getResults(filter, page, size)`, `getResultDetail(id)` em `/process_fraud_automotive/dashboard`. Remove filtros vazios dos parâmetros. |
| `dashboard-filter.model.ts` | Filtros opcionais da Gold. |
| `dashboard-summary.model.ts` | Espelho de `DashboardSummary` (Java). |
| `fraud-result.model.ts` | Espelho de `FraudResult` (Java). |
| `transaction-detail.model.ts` | Espelho de `FraudResultDetail` (Java). |
| `../page/paged-response.model.ts` | `PagedResponse<T>` ≡ `PageResponse<T>` (Java). |

Conversões feitas no painel: score mínimo digitado em % é dividido por 100;
`datetime-local` é enviado como texto ISO local; booleanos `''|'true'|'false'`
viram `undefined|true|false`.

## Dependências internas e externas

- **Internas:** `DashboardService` é usado também por
  [`transaction-detail`](transaction-detail/README.md); `PagedResponse` é usado
  por todas as features.
- **Externas:** `@angular/common` (`CommonModule`, `HttpClient`),
  `@angular/forms` (`ReactiveFormsModule`), `@angular/router`, RxJS
  (`interval`, `switchMap`, `catchError`, `finalize`), `takeUntilDestroyed`.

## Módulos relacionados

- [`imports`](imports/README.md), [`claims`](claims/README.md),
  [`transaction-detail`](transaction-detail/README.md),
  [`models`](models/README.md) — telas carregadas pelas rotas.
- Backend: [`DashboardController`](../../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md).

## Pontos de entrada

`RootComponent` (via `main.ts`) e a rota `''` → `AppComponent`.

## Fluxos importantes

Abertura do painel → resumo imediato e a cada 60 s → resultados com filtros
atuais → clique no ID → `/transactions/:id`.

## Arquivos críticos

- `app.routes.ts`
- `dashboard.service.ts`
- `fraud-result.model.ts` (deve acompanhar `FraudResult` do Java)

## Observações técnicas e débitos identificados

- Nome `AppComponent` para o painel pode confundir com o componente raiz.
- RT-16: o rótulo "pendentes de revisão" usa `pendingReview` (anomalias).
- RT-17: indicador "Ambiente produtivo · Operacional" fixo no `RootComponent`.
- Modelos TypeScript são mantidos manualmente; não há geração a partir da API
  (relacionado a RT-02).
