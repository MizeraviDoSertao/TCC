# src/app/models — Tela "Modelos"

> Parte de [`fraud-dashboard`](../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Permitir que um administrador treine novas versões do modelo de fraude, revise
as métricas e ative a versão que passará a ser usada nas análises.

## Responsabilidade principal

Interface do fluxo de governança de modelos (treino → candidato → ativação).

## Funcionalidades existentes

| Arquivo | Função |
| --- | --- |
| `models.component.ts/.html/.css` | Resumo do modelo em produção, upload do dataset de treino, campos de usuário/senha administrativos (`ngModel`, em memória), histórico das últimas 50 versões com polling de 10 s, métricas em %, mensagens de erro e botão "Ativar modelo" para `READY` ou `ACTIVATION_FAILED`. |
| `model.service.ts` | `list()` (`GET /models`), `train(file, user, password)` (`POST /models/train`) e `activate(id, user, password)` (`POST /models/{id}/activate`), com cabeçalho `Authorization: Basic ...`. |
| `model.model.ts` | `ModelTrainingStatus` e `ModelTraining` (≡ `ModelTrainingView`). |

Rótulos: tipos `SUPERVISED` "Supervisionado", `ANOMALY` "Anomalias"; métricas
`accuracy` "Acurácia", `precision` "Precisão", `recall`, `f1`, `roc_auc`
"ROC AUC"; outras métricas aparecem com o nome original.

## Dependências internas e externas

- **Internas:** nenhuma outra feature.
- **Externas:** `@angular/forms` (`FormsModule`), `HttpHeaders`, RxJS, `btoa`.

## Módulos relacionados

- Backend: `ModelController` e `SecurityConfig`
  ([adapter/in](../../../../tcc/src/main/java/com/unip/fraud/adapter/in/README.md),
  [config](../../../../tcc/src/main/java/com/unip/fraud/config/README.md)).
- [`ml-fraud-py`](../../../../ml-fraud-py/README.md) — executa o treino e a
  ativação de forma assíncrona.

## Pontos de entrada

Rota `/models` (menu "Modelos").

## Fluxos importantes

1. Selecionar dataset + credenciais → "Iniciar treinamento" → 202 com status
   `TRAINING`; o polling mostra `READY` ou `FAILED` quando o Python responder.
2. Em `READY`, "Ativar modelo" → `ACTIVATING` → `ACTIVE`; o modelo anterior
   volta para `READY`.

## Arquivos críticos

- `model.service.ts` — envio das credenciais.
- `model.model.ts` — deve acompanhar `ModelTrainingView` e os status em texto
  do Java.

## Observações técnicas e débitos identificados

- RT-05: as credenciais trafegam em HTTP Basic; sem TLS no ambiente do compose.
- RT-17: as credenciais precisam ser digitadas novamente a cada visita, pois não
  são persistidas (decisão intencional, R-FE-04).
- Métricas de anomalia (`score_low_reference`, `score_high_reference`) são
  exibidas com o pipe `percent`, embora não sejam percentuais.
- RT-04 (**Hipótese**): métricas perfeitas (100%) podem indicar vazamento de
  identificadores, e a tela não alerta sobre isso.
