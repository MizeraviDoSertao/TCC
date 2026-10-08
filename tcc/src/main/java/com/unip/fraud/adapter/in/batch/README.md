# adapter/in/batch — Pipeline de importação de datasets

> Parte de [`adapter/in`](../README.md) no [`tcc`](../../../../../../../../../README.md).
> Regras globais em
> [Arquitetura do Sistema](../../../../../../../../../../docs/ARQUITETURA_DO_SISTEMA.md).

## Objetivo do módulo

Ler arquivos CSV/XLS/XLSX enviados pelo usuário, normalizar cada linha e
distribuí-la entre Bronze, Silver, rejeitados, registro de schema e outbox,
usando o modelo Reader/Processor/Writer do Spring Batch.

## Responsabilidade principal

Transformar uma linha de planilha heterogênea em uma `Transaction` normalizada
(ou em uma rejeição com o motivo), garantindo reinício seguro do job.

## Funcionalidades existentes

| Classe | Papel |
| --- | --- |
| `DatasetReaderStrategy` | Strategy: `supports(fileName)` e `open(file, importId, originalFileName)`. |
| `CsvDatasetReaderStrategy` | CSV UTF-8 com cabeçalho, ignora linhas vazias, `trim`; `sheetName = "CSV"`; número da linha = registro + 1. |
| `ExcelDatasetReaderStrategy` | XLS/XLSX somente leitura; percorre **todas as abas**, usa a primeira linha não vazia de cada aba como cabeçalho; cabeçalho vazio vira `column_<n>`; datas formatadas viram `LocalDateTime`, números viram `BigDecimal`. |
| `DatasetReaderFactory` | Factory: escolhe a primeira estratégia compatível pela extensão. |
| `DatasetRowCursor` | Cursor `read()`/`close()` comum às estratégias. |
| `HeaderValidator` | Cabeçalho obrigatório, nomes ≤ 255 caracteres e sem duplicatas (*case-insensitive*). |
| `DynamicDatasetItemReader` | `ItemStreamReader` com estado (`dynamicDataset.recordIndex`) no `ExecutionContext`; ao reiniciar, pula as linhas já lidas. |
| `DynamicDatasetProcessor` | Normaliza nomes e valores, identifica a coluna de rótulo, gera `transactionId` determinístico e produz `ProcessingOutcome` aceito ou rejeitado. |
| `DatasetBatchWriter` | Para cada resultado: grava Bronze; se aceito, grava Silver, registra schema e enfileira na outbox; se rejeitado, grava em `ops.rejected_record`. |

### Regras do `DynamicDatasetProcessor`

- **Nome de coluna:** NFD sem acentos → minúsculas → `trim` → `[^a-z0-9]+` vira
  `_` → remove `_` das bordas. Vazio ou > 120 caracteres → rejeição.
  Nomes que colidem após normalização → rejeição.
- **Valores de texto**, na ordem: booleano (`true/sim/yes`, `false/nao/não/no`)
  → data (`yyyy-MM-dd`, `dd/MM/yyyy`, `dd-MM-yyyy`) → moeda brasileira
  (`R$ 1.234,56`) → inteiro (`Long`) → decimal (`.` ou `,`) → texto original.
  Texto em branco vira `null`.
- **Rótulo:** coluna cujo nome normalizado está em `imports.target-aliases`.
  Mais de uma coluna de rótulo → rejeição. Valores aceitos: `fraud/fraude/yes/
  sim/true/1` → `true`; `legitimate/legitimo/legítimo/no/nao/não/false/0` →
  `false`; número diferente de 0/1 ou texto desconhecido → rejeição. Sem coluna
  de rótulo → `confirmedFraud = null`.
- A coluna de rótulo **não** entra em `features`; linha sem atributos utilizáveis
  é rejeitada.
- **Schema detectado:** tipo `NULL`, `BOOLEAN`, `NUMBER`, `DATE` ou `STRING`;
  papel `LABEL` ou `FEATURE`.
- **ID:** `UUID.nameUUIDFromBytes(importId:sheetName:rowNumber)`.

## Dependências internas e externas

- **Internas:** `application.domain` (`DatasetRow`, `ProcessingOutcome`,
  `Transaction`, `DetectedColumn`), `application.validation.Validation`,
  portas de saída `BronzeRepositoryOutPort`, `SilverRepositoryOutPort`,
  `DatasetSchemaRepositoryOutPort`, `RejectedRecordRepositoryOutPort`,
  `TransactionOutboxOutPort`.
- **Externas:** Spring Batch (`ItemStreamReader`, `ItemProcessor`,
  `ItemWriter`), Apache POI, Apache Commons CSV.

## Módulos relacionados

- [`config/batch`](../../../config/README.md): `DatasetBatchConfiguration`
  instancia reader (`@StepScope`), processor e writer e define
  `importDatasetStep` (chunk 100) e `datasetImportJob`;
  `ImportJobBatchListener` atualiza o status do import.
- [`adapter/out/batch`](../../out/README.md): `ImportJobLauncherAdapter`
  inicia/reinicia o job.
- [`adapter/out/persistence`](../../out/README.md): implementações das portas.
- [`ml-fraud-py`](../../../../../../../../../../ml-fraud-py/README.md):
  replica a normalização de nomes em `normalization.normalize_name` (R-INT-02).

## Pontos de entrada

Não há chamada direta: o job `datasetImportJob` é iniciado por
`ImportJobLauncherAdapter` com os parâmetros `importId`, `filePath`,
`originalFileName` e `requestedAt`.

## Fluxos importantes

```text
DynamicDatasetItemReader ──DatasetRow──► DynamicDatasetProcessor ──ProcessingOutcome──► DatasetBatchWriter
       (Strategy/Factory)                (normalização + rótulo + ID)                   Bronze sempre
                                                                                        aceito → Silver + schema + outbox
                                                                                        rejeitado → ops.rejected_record
```

Cada chunk de 100 itens é uma transação: Bronze, Silver, schema e outbox são
gravados atomicamente (R-BE-08).

## Arquivos críticos

- `DynamicDatasetProcessor.java` — todas as regras de normalização e rótulo.
- `ExcelDatasetReaderStrategy.java` — leitura multi-aba.
- `DatasetBatchWriter.java` — distribuição entre camadas.

## Observações técnicas e débitos identificados

- AV-03: as regras de normalização e rótulo são regras de negócio, mas estão em
  um adaptador de entrada; o writer chama portas de saída diretamente.
- AV-06: vocabulário de rótulos e normalização de nomes duplicados no Python.
- RT-03 (**Hipótese**): a normalização de valores feita aqui não existe no
  treino do Python.
- RT-09: o progresso do import não é atualizado durante o processamento.
- RT-12 (**Hipótese**): `WorkbookFactory.create` carrega a planilha inteira em
  memória.
- O número da linha CSV é `getRecordNumber() + 1` (considera o cabeçalho); no
  Excel é `getRowNum() + 1`. Linhas totalmente vazias são ignoradas e não
  contam como rejeição.
- Testes: `DatasetReaderStrategyTest` e `DynamicDatasetProcessorTest`.
