# config — Configuração do backend

> Parte de [`tcc`](../../../../../../../README.md). Regras globais em
> [Arquitetura do Sistema](../../../../../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Declarar os beans de infraestrutura que conectam o núcleo às tecnologias:
Spring Batch, Kafka, mapeamento JSON do Hibernate e Spring Security.

## Responsabilidade principal

*Wiring* e políticas transversais (retry/DLT, tópicos, autorização). Não deveria
conter regra de negócio (ver observações).

## Funcionalidades existentes

| Classe | O que configura |
| --- | --- |
| `batch/DatasetBatchConfiguration` | Beans `dynamicDatasetItemReader` (`@StepScope`, parâmetros `filePath`, `importId`, `originalFileName`), `dynamicDatasetProcessor` (aliases de `imports.target-aliases`), `datasetBatchWriter`, `importDatasetStep` (chunk 100) e `datasetImportJob`. |
| `batch/ImportJobBatchListener` | `beforeJob`: import → `PROCESSING`. `afterJob`: conta Silver e rejeitados do import e define `COMPLETED`, `COMPLETED_WITH_WARNINGS` (há rejeições) ou `FAILED` (com a primeira mensagem de erro). |
| `kafka/KafkaConsumerConfig` | `ConsumerFactory` (String/String, auto-commit desligado) e `kafkaListenerContainerFactory` com `AckMode.RECORD` e `DefaultErrorHandler(DeadLetterPublishingRecoverer, FixedBackOff(1000 ms, 3))`. |
| `kafka/KafkaProducerConfig` | `ProducerFactory` e `KafkaTemplate<String, String>`. |
| `kafka/KafkaTopicConfig` | Cria `transactions` (3 partições), `fraud-results` (3), `fraud-results.DLT` (3) e os quatro tópicos `model-*` (1 partição cada), todos com réplica 1. |
| `persistence/HibernateJsonConfiguration` | `JacksonJsonFormatMapper` (Jackson 2) com `findAndRegisterModules()` e datas ISO para colunas JSONB. |
| `security/SecurityConfig` | `BCryptPasswordEncoder`; usuário único em memória (`models.security.admin-user/password`, role `MODEL_ADMIN`); sessão *stateless*; CSRF desabilitado; HTTP Basic; `POST /models/**` exige `MODEL_ADMIN`, o restante é `permitAll`. |

## Dependências internas e externas

- **Internas:** `adapter.in.batch.*` (reader, processor, writer, factory),
  `application.port.out.*` (repositórios usados pelo writer e pelo listener),
  `application.domain.*`.
- **Externas:** Spring Batch, spring-kafka, Kafka clients, Hibernate,
  Jackson 2, Spring Security.

## Módulos relacionados

- [`adapter/in/batch`](../adapter/in/batch/README.md) — componentes do job.
- [`adapter/in`](../adapter/in/README.md) — listeners Kafka usam a fábrica
  `kafkaListenerContainerFactory`; controllers são protegidos pelo
  `SecurityConfig`.
- [`adapter/out`](../adapter/out/README.md) — produtores usam o `KafkaTemplate`.

## Pontos de entrada

Classes `@Configuration` e o `@Component` `ImportJobBatchListener`, carregados
pelo Spring na inicialização.

## Fluxos importantes

- **Retry/DLT no backend:** qualquer exceção em um `@KafkaListener` gera 3 novas
  tentativas com 1 s de intervalo; depois a mensagem vai para `<tópico>.DLT`.
- **Ciclo do import no Batch:** `beforeJob` → chunks → `afterJob` grava
  contagens finais e status.

## Arquivos críticos

- `security/SecurityConfig.java` — superfície de acesso da API.
- `kafka/KafkaTopicConfig.java` — tópicos provisionados.
- `batch/ImportJobBatchListener.java` — status final dos imports.

## Observações técnicas e débitos identificados

- AV-03: `ImportJobBatchListener` contém regra de transição de status e usa
  portas de saída diretamente a partir de `config`.
- RT-05: apenas `POST /models/**` é protegido; credenciais padrão
  `admin/admin-local`; CSRF desabilitado.
- RT-07: só `fraud-results.DLT` é criado; o `DefaultErrorHandler` também
  publica em `model-training-results.DLT` e `model-activation-results.DLT`, que
  não são declarados.
- RT-09: contagens só são gravadas em `afterJob`.
- RT-15: convivem `com.fasterxml.jackson` (Hibernate) e `tools.jackson`
  (aplicação).
- `spring.batch.jdbc.initialize-schema: always` cria as tabelas `BATCH_*` fora
  do Flyway.
