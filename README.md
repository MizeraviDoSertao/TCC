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
