# fraud-dashboard — Frontend FraudGuard (Angular)

> Documentos globais: [Arquitetura do Sistema](../docs/ARQUITETURA_DO_SISTEMA.md) ·
> [Objetivo do Sistema](../docs/OBJETIVO_DO_SISTEMA.md). Códigos `AV-`, `OR-` e
> `RT-` referem-se à seção 10 da Arquitetura.

## Objetivo do módulo

Interface web operacional do FraudGuard para importar arquivos, acompanhar o
processamento, explorar sinistros, investigar resultados do modelo e governar
versões de modelo.

## Responsabilidade principal

Apresentação e interação. Toda regra de negócio e todo dado vêm da API do
backend (`tcc`); o frontend não guarda estado persistente.

## Funcionalidades existentes

| Rota | Tela | Funcionalidades |
| --- | --- | --- |
| `/` | Painel (`AppComponent`) | Indicadores Bronze/Silver/Gold/rejeitados, % previsto como fraude, distribuição por risco, lista paginada de resultados com filtros (decisão da IA, fraude confirmada, risco, score mínimo em %, versão do modelo, período). Atualiza o resumo a cada 60 s. |
| `/imports` | Analisar (`ImportsComponent`) | Upload CSV/XLS/XLSX, histórico (atualizado a cada 15 s), detalhes, primeiras 20 rejeições, retry de imports falhos. |
| `/claims` | Sinistros (`ClaimsComponent`) | Busca textual, filtro por importação e por coluna dinâmica, painel de atributos de uma linha. |
| `/transactions/:transactionId` | Detalhe (`TransactionDetailComponent`) | Resultado Gold + atributos Silver com busca. |
| `/models` | Modelos (`ModelsComponent`) | Treino com credenciais administrativas, histórico de versões e métricas (atualizado a cada 10 s), ativação. |
| `**` | — | Redireciona para `/`. |

## Dependências internas e externas

| Tipo | Dependência |
| --- | --- |
| Framework | Angular `^17.3.0` (componentes standalone, Router, Reactive/Template Forms, HttpClient) |
| Bibliotecas | RxJS `~7.8.0`, zone.js `~0.14.0`, TypeScript `~5.4.0` (`strict: true`) |
| Build | `@angular-devkit/build-angular:application` → `dist/fraud-dashboard-angular/browser` |
| Runtime (contêiner) | Nginx 1.27 (`nginx.conf`) |
| Backend | API REST do `tcc` em `/process_fraud_automotive` |

## Módulos relacionados

- [`tcc`](../tcc/README.md) — única API consumida.
- Pastas internas: [`src/app`](src/app/README.md),
  [`imports`](src/app/imports/README.md), [`claims`](src/app/claims/README.md),
  [`transaction-detail`](src/app/transaction-detail/README.md),
  [`models`](src/app/models/README.md).

## Pontos de entrada

| Arquivo | Papel |
| --- | --- |
| `src/main.ts` | `bootstrapApplication(RootComponent)` com `provideHttpClient()` e `provideRouter(routes)` |
| `src/index.html` | `<app-root>`, `lang="pt-BR"` |
| `src/app/root.component.ts` | Shell: cabeçalho, navegação, `<router-outlet>`, rodapé |
| `src/app/app.routes.ts` | Rotas *lazy-loaded* |

## Fluxos importantes

- **Desenvolvimento:** `npm start` → `ng serve --proxy-config proxy.conf.json`;
  chamadas a `/process_fraud_automotive` vão para `http://localhost:8080`.
- **Contêiner:** build Node 20 → Nginx; `location /process_fraud_automotive/`
  faz proxy para `http://backend:8080`; demais rotas fazem *fallback* para
  `index.html`; `client_max_body_size 50m`.

```bash
npm install
npm start        # http://localhost:4200
npm run build    # validação de compilação
```

## Arquivos críticos

| Arquivo | Motivo |
| --- | --- |
| `src/app/app.routes.ts` | Mapa de telas |
| `src/app/*.service.ts` e `src/app/*/*.service.ts` | Contratos HTTP |
| `src/app/*.model.ts` e `src/app/*/*.model.ts` | Espelho dos records Java |
| `nginx.conf`, `proxy.conf.json` | Roteamento para o backend e limite de upload |
| `src/styles.css` | Estilos globais compartilhados (botões, painéis, alertas) |

## Observações técnicas e débitos identificados

- OR-03: não há tela para revisão humana (`POST /claims/{id}/reviews`), nem uso
  de `GET /imports/{id}` e `GET /claims/{id}`.
- RT-09: a barra de progresso de importação só avança quando o job termina.
- RT-14: não há testes nem *script* de teste no `package.json`.
- RT-16: o card "pendentes de revisão" mostra resultados sem decisão do modelo
  (anomalia), não revisões humanas pendentes.
- RT-17: o cabeçalho mostra "Ambiente produtivo · Operacional" fixo.
- O componente do painel chama-se `AppComponent` (arquivos `app.component.*`),
  enquanto o *shell* é `RootComponent`; o nome não reflete o papel.
- `angular.json` contém um ID de *analytics* do Angular CLI versionado.
