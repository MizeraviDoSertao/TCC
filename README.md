# FraudGuard

Plataforma de análise de fraude automotiva com dashboard Angular, API Spring
Boot, processamento assíncrono por Kafka e modelos de machine learning em
Python.

## Executar o projeto

Requisitos: Docker com Docker Compose.

```bash
docker compose up --build
```

Depois, acesse [http://localhost:4200](http://localhost:4200). O Compose inicia
automaticamente o frontend, backend, PostgreSQL, Kafka e o serviço Python.

Para encerrar:

```bash
docker compose down
```

## Fluxos separados

- **Analisar:** recebe arquivos operacionais e calcula o risco usando o modelo
  ativo. Esse fluxo nunca retreina o modelo.
- **Modelos:** recebe um dataset histórico, treina uma versão candidata e exibe
  suas métricas. Apenas depois de uma ativação administrativa ela passa a ser
  usada nas análises. Bases rotuladas geram um modelo supervisionado; bases sem
  rótulo geram um detector de anomalias que exige revisão humana.

Por padrão, o ambiente local usa o usuário `admin` e a senha `admin-local`.
Defina credenciais próprias antes de iniciar um ambiente compartilhado:

```bash
MODEL_ADMIN_USER='gestor' MODEL_ADMIN_PASSWORD='uma-senha-forte' docker compose up --build
```

O backend exige a função administrativa nos pedidos de treinamento e ativação.
O frontend não persiste as credenciais no navegador.

## Documentação técnica

Base oficial para evolução no modelo Spec Driven Development:

- [Arquitetura do Sistema](docs/ARQUITETURA_DO_SISTEMA.md): visão arquitetural,
  regras, contratos (API, Kafka, banco), dependências, riscos e diretrizes.
- [Objetivo do Sistema](docs/OBJETIVO_DO_SISTEMA.md): propósito, atores, fluxos
  de negócio e contexto operacional.
- [Regras do Projeto](docs/REGRAS_DO_PROJETO.md): o que já foi implementado, o
  que ainda será e o que está fora do escopo. Toda análise deve segui-las.
- [Especificações](specs/README.md): uma spec por mudança, no modelo adaptado do
  spec-kit. No Claude Code, use `/especificar <pedido>`.
- READMEs por módulo:
  - Backend: [tcc](tcc/README.md) ·
    [application](tcc/src/main/java/com/unip/fraud/application/README.md) ·
    [adapter/in](tcc/src/main/java/com/unip/fraud/adapter/in/README.md) ·
    [adapter/in/batch](tcc/src/main/java/com/unip/fraud/adapter/in/batch/README.md) ·
    [adapter/out](tcc/src/main/java/com/unip/fraud/adapter/out/README.md) ·
    [config](tcc/src/main/java/com/unip/fraud/config/README.md) ·
    [db/migration](tcc/src/main/resources/db/migration/README.md)
  - ML: [ml-fraud-py](ml-fraud-py/README.md) ·
    [fraud_detection](ml-fraud-py/fraud_detection/README.md) ·
    [application](ml-fraud-py/fraud_detection/application/README.md) ·
    [training](ml-fraud-py/fraud_detection/training/README.md) ·
    [infrastructure](ml-fraud-py/fraud_detection/infrastructure/README.md)
  - Frontend: [fraud-dashboard](fraud-dashboard/README.md) ·
    [src/app](fraud-dashboard/src/app/README.md) ·
    [imports](fraud-dashboard/src/app/imports/README.md) ·
    [claims](fraud-dashboard/src/app/claims/README.md) ·
    [transaction-detail](fraud-dashboard/src/app/transaction-detail/README.md) ·
    [models](fraud-dashboard/src/app/models/README.md)
