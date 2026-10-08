# src/app/transaction-detail — Detalhe de uma análise

> Parte de [`fraud-dashboard`](../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Mostrar, em uma única tela, o resultado do modelo para um sinistro (Gold) e os
atributos normalizados de origem (Silver).

## Responsabilidade principal

Visão individual e rastreável de uma decisão do modelo.

## Funcionalidades existentes

| Arquivo | Função |
| --- | --- |
| `transaction-detail.component.ts/.html/.css` | Lê `:transactionId`, chama `DashboardService.getResultDetail`, mostra risco, decisão, score em %, threshold, rótulo confirmado, modelo, tipo de score, classificação, motivos, arquivo de origem, datas Silver/Gold e a grade de atributos com busca. Estados de carregamento e "não encontrado". |

O modelo `TransactionDetail` fica em `../transaction-detail.model.ts`
(≡ `FraudResultDetail` do Java). O campo `ingestedAt` é exibido como "Entrada
na Silver" (no Java, ele recebe `processedAt` da Silver).

## Dependências internas e externas

- **Internas:** `DashboardService` e `TransactionDetail` de
  [`src/app`](../README.md).
- **Externas:** `@angular/forms` (`FormControl`), `@angular/router`, RxJS.

## Módulos relacionados

- [`src/app`](../README.md) (painel) e [`claims`](../claims/README.md) — origem
  dos links.
- Backend: `GET /dashboard/results/{transactionId}`
  ([adapter/in](../../../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md)).

## Pontos de entrada

Rota `/transactions/:transactionId`.

## Fluxos importantes

Parâmetro da rota → `GET /dashboard/results/{id}` → sucesso exibe o detalhe;
qualquer erro (inclusive 404 ou falha de rede) exibe "Análise não encontrada".

## Arquivos críticos

- `transaction-detail.component.ts`
- `../transaction-detail.model.ts`

## Observações técnicas e débitos identificados

- Todo erro HTTP é tratado como "não encontrado", sem distinguir indisponibilidade
  do backend.
- O link "Voltar aos resultados" sempre leva ao painel, mesmo quando a origem foi
  a tela de sinistros.
- OR-03: a tela mostra o rótulo confirmado, mas não permite registrar revisão.
- Funções de formatação duplicadas com [`claims`](../claims/README.md).
