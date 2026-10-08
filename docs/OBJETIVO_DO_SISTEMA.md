# Objetivo do Sistema

> Documento global de produto do FraudGuard. Complementa a
> [Arquitetura do Sistema](./ARQUITETURA_DO_SISTEMA.md). Afirmações sem marcação
> refletem o código do branch `homolog`; inferências estão marcadas como
> **Hipótese**.

## 1. Propósito principal

O **FraudGuard** é uma plataforma de **análise de risco de fraude em sinistros
automotivos**. Ela recebe planilhas de sinistros (CSV, XLS ou XLSX), organiza os
dados de forma auditável e calcula, com um modelo de machine learning governado
por um administrador, a probabilidade ou o grau de anomalia de cada sinistro.
O resultado ajuda a decidir quais casos investigar primeiro.

Identidade no código: título `FraudGuard · Inteligência de risco` e descrição
"Central de inteligência para análise e monitoramento de fraudes automotivas"
(`fraud-dashboard/src/index.html`).

**Hipótese:** o projeto é um Trabalho de Conclusão de Curso (pasta `tcc/`,
pacote `com.unip.fraud`, groupId `br.com.unip`), e não um produto em operação
comercial.

## 2. Problemas que o sistema resolve

| Problema | Como o sistema responde |
| --- | --- |
| Planilhas com colunas diferentes a cada fonte | Colunas são descobertas dinamicamente, normalizadas e guardadas em JSONB; nenhuma coluna é fixa no código ou no banco. |
| Linhas com dados inválidos misturadas a linhas boas | Linhas inválidas vão para quarentena (`ops.rejected_record`) com o dado original e o motivo; o restante segue no fluxo. |
| Perda de rastreabilidade entre dado bruto e decisão | Arquitetura medalhão: Bronze (bruto), Silver (normalizado), Gold (score e explicação), com versão do modelo em cada resultado. |
| Reenvio acidental do mesmo arquivo | Deduplicação por SHA-256 enquanto o import anterior está ativo ou concluído. |
| Falhas no meio de arquivos grandes | Spring Batch em chunks de 100 linhas e reinício de imports falhos (`POST /imports/{id}/retry`). |
| Datasets sem a informação de fraude confirmada | Sem rótulo, o treino gera um detector de anomalias; o score é tratado como risco relativo e exige revisão humana (`predictedFraud = null`). |
| Troca de modelo arriscada em produção | O treino gera apenas um candidato com métricas; só passa a valer após ativação explícita por um administrador. |
| Necessidade de confirmação humana | Endpoint de revisão registra `FRAUD`, `LEGITIMATE` ou `INCONCLUSIVE` com histórico imutável (sem tela; ver seção 6). |

## 3. Atores envolvidos

| Ator | Interação | Evidência |
| --- | --- | --- |
| **Analista de sinistros / fraude** | Envia arquivos para análise, acompanha importações, consulta sinistros e resultados, filtra por risco. | Telas `Painel`, `Analisar`, `Sinistros`, detalhe da transação. Sem autenticação. |
| **Administrador de modelos** (`ROLE_MODEL_ADMIN`) | Treina e ativa versões de modelo. | `SecurityConfig` exige o papel em `POST /models/**`; credenciais via `MODEL_ADMIN_USER`/`MODEL_ADMIN_PASSWORD`. |
| **Revisor humano** | Confirma ou descarta fraude em um sinistro. | `POST /claims/{id}/reviews` com campo `reviewer` em texto livre. **Hipótese:** papel ainda sem interface própria. |
| **Serviço de ML (ator de sistema)** | Consome transações, publica scores, treina e ativa modelos. | `ml-fraud-py` via Kafka. |
| **Operador de infraestrutura** | Sobe o ambiente e define credenciais e variáveis. | `docker-compose.yml`, README raiz. |

## 4. Principais fluxos de negócio

### 4.1 Governança do modelo (pré-requisito)

1. O administrador envia um **dataset histórico** na tela *Modelos*.
2. O sistema treina um **candidato**:
   - com coluna de fraude reconhecida (aliases padrão `fraudfound_p`, `fraud`,
     `is_fraud`, `fraude`, `isfraud`, `label`): **Random Forest
     supervisionado**, com métricas de acurácia, precisão, recall, F1 e ROC AUC
     em um holdout estratificado de 25% e reajuste final com todos os dados
     rotulados;
   - sem coluna de fraude: **Isolation Forest** (detecção de anomalias), com
     taxa de anomalia de treino e referências de score.
3. O administrador revisa as métricas e **ativa** o candidato.
4. O modelo ativado passa a ser usado nas próximas análises sem reiniciar o
   serviço.

Enquanto nenhum modelo foi ativado, o backend recusa novas análises com a
mensagem "Activate a fraud model before submitting transactions for analysis".

### 4.2 Análise de sinistros

1. O analista envia um arquivo operacional na tela *Analisar* (máximo de 50 MB).
2. O sistema registra a importação, lê todas as linhas (todas as abas, no caso
   do Excel), normaliza nomes e valores (booleanos, datas `yyyy-MM-dd`,
   `dd/MM/yyyy`, `dd-MM-yyyy`, moeda `R$ 1.234,56`, inteiros e decimais) e
   separa linhas válidas de rejeitadas.
3. Cada linha válida é enviada para pontuação. O resultado traz:
   - `probability` (0–1) e `scoreType` (`FRAUD_PROBABILITY` ou `ANOMALY_SCORE`);
   - `riskLevel`: `HIGH` (≥ 0,7), `MEDIUM` (≥ 0,3) ou `LOW`;
   - `predictedFraud` (supervisionado: `probability ≥ threshold`, padrão 0,5;
     anomalia: sempre `null`);
   - `classification` e `reasons` (para modelos supervisionados, as três
     features mais importantes do modelo; não é uma explicação por sinistro).
4. O analista acompanha o status (`Na fila`, `Processando`, `Concluído`,
   `Concluído com alertas`, `Falhou`) e as primeiras rejeições, e pode reiniciar
   imports falhos.

### 4.3 Investigação

1. O **Painel** mostra contadores Bronze/Silver/Gold/rejeitados, alertas da IA,
   fraudes confirmadas, distribuição por risco e a lista paginada de resultados
   com filtros (decisão da IA, fraude confirmada, risco, score mínimo, versão do
   modelo, período).
2. A tela **Sinistros** permite buscar texto em todos os dados normalizados e
   filtrar por uma coluna dinâmica descoberta naquela importação.
3. O **detalhe da transação** reúne o resultado (Gold) e todos os atributos
   normalizados (Silver).

### 4.4 Revisão humana

Um revisor registra a decisão final do sinistro. A decisão atualiza o rótulo
confirmado nas camadas Silver e Gold e fica registrada em `review.fraud_review`.
**Hipótese:** os rótulos confirmados servirão de base para novos datasets de
treino; hoje não existe exportação ou retreino automático a partir deles.

## 5. Funcionalidades centrais

| Funcionalidade | Backend | Tela |
| --- | --- | --- |
| Upload e importação assíncrona de CSV/XLS/XLSX | `POST /imports` | Analisar |
| Histórico, progresso e reprocessamento de importações | `GET /imports`, `POST /imports/{id}/retry` | Analisar |
| Quarentena de linhas inválidas | `GET /imports/{id}/errors` | Analisar (até 20 primeiras) |
| Registro do schema dinâmico detectado | `GET /imports/{id}/schema` | Sinistros (filtro por coluna) |
| Exploração de sinistros normalizados | `GET /claims` | Sinistros |
| Indicadores agregados | `GET /dashboard/summary` | Painel |
| Resultados do modelo com filtros | `GET /dashboard/results` | Painel |
| Detalhe Gold + Silver de um sinistro | `GET /dashboard/results/{id}` | Detalhe da transação |
| Treino de modelo candidato | `POST /models/train` | Modelos |
| Ativação de modelo | `POST /models/{id}/activate` | Modelos |
| Histórico de versões (últimas 50) | `GET /models` | Modelos |
| Revisão humana | `POST /claims/{id}/reviews` | — |

## 6. Visão de produto

- **Proposta de valor:** priorizar a investigação de sinistros suspeitos com um
  pipeline auditável (do dado bruto ao score, com versão do modelo), aceitando
  planilhas heterogêneas sem trabalho de engenharia a cada nova fonte.
- **Princípios visíveis no código e na interface:**
  - *Decisão assistida, não automática:* o score orienta; a confirmação de
    fraude é humana. Modelos de anomalia nunca afirmam fraude.
  - *Modelo protegido:* o fluxo de análise nunca altera o modelo; a troca é um
    ato administrativo explícito.
  - *Rastreabilidade:* `modelVersion`, hash do dataset, linhas rejeitadas com o
    dado original e histórico de revisões.
- **Lacunas atuais em relação a essa visão** (detalhes e IDs na
  [Arquitetura](./ARQUITETURA_DO_SISTEMA.md#10-riscos-técnicos-acoplamentos-e-violações)):
  revisão humana sem tela (OR-03); explicação genérica em vez de por sinistro;
  rotas operacionais sem autenticação (RT-05); progresso de importação só no
  fim (RT-09); possível divergência entre treino e inferência (RT-03,
  **Hipótese**).

## 7. Contexto operacional

| Aspecto | Situação atual |
| --- | --- |
| Implantação | Docker Compose em um único host: frontend `:4200`, backend `:8080`, PostgreSQL `:5432`, Kafka `:9092`. |
| Inicialização | `docker compose up --build`; o Flyway cria os schemas e o Spring Batch cria suas tabelas automaticamente. |
| Estado inicial | Sem modelo ativo: é obrigatório treinar e ativar um modelo antes da primeira análise. |
| Credenciais padrão | Administrador `admin` / `admin-local`; banco `postgres` / `postgres`. Devem ser trocadas em ambiente compartilhado. |
| Limites | Upload de até 50 MB (Spring multipart, `IMPORT_MAX_FILE_SIZE` e `client_max_body_size` do Nginx); páginas de até 100 itens; chunk de 100 linhas; outbox publica até 100 eventos por ciclo de 1 s. |
| Atualização da interface | Painel a cada 60 s, importações a cada 15 s, modelos a cada 10 s (polling). |
| Persistência | Volumes Docker `fraud-postgres`, `fraud-imports` e `fraud-models`. |
| Observabilidade | Apenas logs de aplicação (SLF4J no Java, `logging` no Python); não há métricas, health check HTTP nem tracing configurados. |
| Idioma | Interface em português; mensagens de erro da API em inglês. |
| Execução local sem Docker | Backend: `./mvnw spring-boot:run` (com PostgreSQL e Kafka locais). ML: `python -m fraud_detection serve`. Frontend: `npm start` (proxy para `localhost:8080`). |
