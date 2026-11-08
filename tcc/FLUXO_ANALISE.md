# Fluxo de análise

A documentação anterior descrevia apenas a consulta ao dashboard e não
representava mais o fluxo de ingestão assíncrona.

> **Atualização:** a documentação oficial agora está em
> [docs/ARQUITETURA_DO_SISTEMA.md](../docs/ARQUITETURA_DO_SISTEMA.md)
> (fluxos na seção 6) e no [README do backend](./README.md).

A documentação anterior estava em [ARCHITECTURE.md](./ARCHITECTURE.md) e cobre:

- upload de CSV/XLS/XLSX;
- Spring Batch;
- camadas Bronze, Silver e Gold;
- colunas dinâmicas;
- transactional outbox e Kafka;
- registros rejeitados;
- confirmação humana de fraude;
- APIs de consulta e filtros.
