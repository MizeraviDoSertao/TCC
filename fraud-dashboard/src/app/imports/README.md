# src/app/imports — Tela "Analisar"

> Parte de [`fraud-dashboard`](../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Permitir que o analista envie arquivos de sinistros para análise e acompanhe o
processamento de cada importação.

## Responsabilidade principal

Interface do fluxo "Analisar" (upload → Spring Batch → scoring). Deixa claro
que este fluxo **não altera** o modelo ativo.

## Funcionalidades existentes

| Arquivo | Função |
| --- | --- |
| `imports.component.ts/.html/.css` | Seleção de arquivo (`.csv,.xls,.xlsx`), upload, histórico com polling de 15 s (50 mais recentes), barra de progresso, status em português, painel de detalhes, até 20 rejeições, botão "Tentar novamente" para `FAILED`, link "Explorar dados" para `/claims?importId=...`. |
| `import.service.ts` | `list(page, size)`, `upload(file)` (multipart `file`), `retry(importId)`, `errors(importId, page, size)` em `/process_fraud_automotive/imports`. |
| `import.model.ts` | `ImportStatus`, `ImportJob` (≡ `ImportJobView`), `RejectedRecord` (≡ `RejectedRecordView`). |

Status exibidos: `QUEUED` "Na fila", `PROCESSING` "Processando", `COMPLETED`
"Concluído", `COMPLETED_WITH_WARNINGS` "Concluído com alertas", `FAILED`
"Falhou". Mensagens de erro do backend (`error.message`) são mostradas como
vieram (em inglês).

## Dependências internas e externas

- **Internas:** `PagedResponse` (`src/page`). `ImportService` e `ImportJob` são
  reutilizados por [`claims`](../claims/README.md).
- **Externas:** `@angular/common`, `@angular/router` (`RouterLink`), RxJS.

## Módulos relacionados

- [`claims`](../claims/README.md) — destino de "Explorar dados".
- Backend: `ImportController` e `ImportInspectionController`
  ([adapter/in](../../../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md)).

## Pontos de entrada

Rota `/imports` (menu "Analisar" e botão "Nova análise" do painel).

## Fluxos importantes

1. Escolher arquivo → "Iniciar análise" → `POST /imports` → o import retornado
   vai para o topo da lista e fica selecionado. Se o arquivo for duplicado, o
   backend devolve o import já existente.
2. Polling atualiza o import selecionado.
3. Ao selecionar um import com rejeições, carrega `GET /imports/{id}/errors`.
4. Import `FAILED` → `POST /imports/{id}/retry`.

## Arquivos críticos

- `imports.component.ts` — `progress()` e sincronização da seleção.
- `import.model.ts` — deve acompanhar `ImportJobView` e `ImportStatus` do Java.

## Observações técnicas e débitos identificados

- RT-09: `progress()` usa `totalRows`, que o backend só preenche no fim; durante
  o processamento a barra fica em 0%.
- Sem modelo ativo, o upload falha com a mensagem do backend "Activate a fraud
  model before submitting transactions for analysis".
- O seletor de importações da tela de sinistros busca até 100 imports; esta tela
  mostra 50.
