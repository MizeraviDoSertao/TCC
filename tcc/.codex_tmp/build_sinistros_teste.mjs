import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs/sinistro_testes_20260930";
const outputPath = `${outputDir}/sinistros_teste.xlsx`;
const fontFamily = "Arial";

const date = (year, month, day) => new Date(year, month - 1, day, 12, 0, 0);

const headers = [
  "id_sinistro",
  "numero_apolice",
  "segurado_id",
  "data_sinistro",
  "data_aviso",
  "tipo_sinistro",
  "valor_sinistro",
  "valor_franquia",
  "estado",
  "cidade",
  "dias_ate_aviso",
  "sinistros_ultimos_12m",
  "boletim_ocorrencia",
  "oficina_rede",
  "canal_aviso",
  "descricao",
  "fraude",
];

const rows = [
  ["SIN-2026-0001", "AP-100001", "SEG-0001", date(2026, 1, 8), date(2026, 1, 8), "Colisão", 12850.75, 2200, "SP", "São Paulo", 0, 0, true, true, "Aplicativo", "Colisão traseira em via urbana; fotos e boletim anexados.", 0],
  ["SIN-2026-0002", "AP-100002", "SEG-0002", date(2026, 1, 11), date(2026, 1, 15), "Roubo", 68500, 0, "RJ", "Rio de Janeiro", 4, 1, true, false, "Telefone", "Veículo informado como roubado durante a madrugada.", 0],
  ["SIN-2026-0003", "AP-100003", "SEG-0003", date(2026, 1, 19), date(2026, 2, 2), "Colisão", 47200, 3500, "MG", "Belo Horizonte", 14, 3, false, false, "Corretor", "Aviso tardio e reparo iniciado antes da vistoria.", 1],
  ["SIN-2026-0004", "AP-100004", "SEG-0004", date(2026, 2, 3), date(2026, 2, 3), "Alagamento", 18900.5, 1800, "RS", "Porto Alegre", 0, 0, false, true, "Portal", "Danos elétricos após alagamento em garagem.", 0],
  ["SIN-2026-0005", "AP-100005", "SEG-0005", date(2026, 2, 10), date(2026, 2, 11), "Furto", 32700, 0, "PR", "Curitiba", 1, 0, true, false, "Aplicativo", "Furto em estacionamento aberto; chave em posse do segurado.", 0],
  ["SIN-2026-0006", "AP-100006", "SEG-0006", date(2026, 2, 18), date(2026, 3, 7), "Incêndio", 91000, 0, "BA", "Salvador", 17, 2, false, false, "Telefone", "Incêndio sem laudo inicial e com divergência no local informado.", 1],
  ["SIN-2026-0007", "AP-100007", "SEG-0007", date(2026, 3, 1), date(2026, 3, 1), "Vidros", 1850.9, 450, "SC", "Florianópolis", 0, 0, false, true, "Aplicativo", "Trinca no para-brisa após impacto de pedra.", 0],
  ["SIN-2026-0008", "AP-100008", "SEG-0008", date(2026, 3, 9), date(2026, 3, 10), "Colisão", 9350, 1500, "PE", "Recife", 1, 1, true, true, "Portal", "Dano lateral em cruzamento com terceiro identificado.", 0],
  ["SIN-2026-0009", "AP-100009", "SEG-0009", date(2026, 3, 14), date(2026, 3, 29), "Roubo", 74200, 0, "SP", "Campinas", 15, 4, true, false, "Corretor", "Múltiplos avisos recentes e versões divergentes do horário.", 1],
  ["SIN-2026-0010", "AP-100010", "SEG-0010", date(2026, 3, 22), date(2026, 3, 22), "Danos a terceiros", 7800, 1200, "GO", "Goiânia", 0, 0, true, true, "Telefone", "Dano em portão residencial durante manobra.", 0],
  ["SIN-2026-0011", "AP-100011", "SEG-0011", date(2026, 4, 4), date(2026, 4, 5), "Colisão", 21400, 2800, "CE", "Fortaleza", 1, 1, true, true, "Aplicativo", "Colisão frontal com acionamento de airbag.", 0],
  ["SIN-2026-0012", "AP-100012", "SEG-0012", date(2026, 4, 12), date(2026, 4, 26), "Perda total", 118000, 0, "DF", "Brasília", 14, 2, false, false, "Portal", "Veículo removido antes da regulação; documentação incompleta.", 1],
  ["SIN-2026-0013", "AP-100013", "SEG-0013", date(2026, 4, 18), date(2026, 4, 18), "Granizo", 6400, 900, "SC", "Joinville", 0, 0, false, true, "Aplicativo", "Danos no teto e capô após tempestade de granizo.", 0],
  ["SIN-2026-0014", "AP-100014", "SEG-0014", date(2026, 5, 2), date(2026, 5, 3), "Colisão", 15600, 2000, "ES", "Vitória", 1, 0, true, true, "Corretor", "Colisão em rotatória com testemunha identificada.", 0],
  ["SIN-2026-0015", "AP-100015", "SEG-0015", date(2026, 5, 8), date(2026, 5, 20), "Furto", 59900, 0, "AM", "Manaus", 12, 3, false, false, "Telefone", "Sem boletim no aviso e última localização incompatível.", 1],
  ["SIN-2026-0016", "AP-100016", "SEG-0016", date(2026, 5, 17), date(2026, 5, 17), "Assistência", 980, 0, "SP", "Santos", 0, 0, false, true, "Aplicativo", "Pane elétrica com remoção por guincho credenciado.", 0],
  ["SIN-2026-0017", "AP-100017", "SEG-0017", date(2026, 5, 26), date(2026, 5, 27), "Colisão", 28900, 3000, "MT", "Cuiabá", 1, 1, true, false, "Portal", "Saída de pista em rodovia; vistoria pendente.", 0],
  ["SIN-2026-0018", "AP-100018", "SEG-0018", date(2026, 6, 5), date(2026, 6, 24), "Incêndio", 84500, 0, "PA", "Belém", 19, 5, false, false, "Corretor", "Cobertura contratada recentemente e ausência de laudo técnico.", 1],
  ["SIN-2026-0019", "AP-100019", "SEG-0019", date(2026, 6, 13), date(2026, 6, 13), "Vidros", 2300, 500, "MG", "Uberlândia", 0, 0, false, true, "Aplicativo", "Quebra de vidro lateral em estacionamento.", 0],
  ["SIN-2026-0020", "AP-100020", "SEG-0020", date(2026, 6, 29), date(2026, 6, 30), "Alagamento", 25800, 2200, "RJ", "Niterói", 1, 1, true, true, "Portal", "Entrada de água no motor durante chuva intensa.", 0],
  ["SIN-2026-0021", "AP-100021", "SEG-0021", date(2026, 7, 7), date(2026, 7, 16), "Colisão", 53600, 4000, "SP", "Sorocaba", 9, 4, false, false, "Telefone", "Orçamentos repetidos e incompatíveis com as imagens.", 1],
  ["SIN-2026-0022", "AP-100022", "SEG-0022", date(2026, 7, 15), date(2026, 7, 15), "Danos a terceiros", 11200, 1800, "PR", "Londrina", 0, 0, true, true, "Aplicativo", "Abalroamento lateral com terceiro e boletim digital.", 0],
  ["SIN-2026-0023", "AP-100023", "SEG-0023", date(2026, 7, 28), date(2026, 7, 29), "Roubo", 97200, 0, "PE", "Olinda", 1, 0, true, false, "Portal", "Roubo com registro policial e rastreador desativado após o evento.", 0],
  ["SIN-2026-0024", "AP-100024", "SEG-0024", date(2026, 8, 6), date(2026, 8, 23), "Perda total", 132500, 0, "BA", "Feira de Santana", 17, 3, false, false, "Corretor", "Aviso tardio, condutor não cadastrado e documentos divergentes.", 1],
  ["SIN-2026-0025", "AP-100025", "SEG-0025", date(2026, 8, 19), date(2026, 8, 19), "Colisão", 17650, 2500, "RS", "Caxias do Sul", 0, 1, true, true, "Aplicativo", "Colisão traseira em congestionamento.", 0],
  ["SIN-2026-0026", "AP-100026", "SEG-0026", date(2026, 8, 27), date(2026, 8, 28), "Granizo", 7300, 1000, "GO", "Anápolis", 1, 0, false, true, "Portal", "Amassados distribuídos pela carroceria após granizo.", 0],
  ["SIN-2026-0027", "AP-100027", "SEG-0027", date(2026, 9, 3), date(2026, 9, 13), "Furto", 44500, 0, "CE", "Juazeiro do Norte", 10, 2, false, false, "Telefone", "Chave reserva não apresentada e versão alterada no segundo contato.", 1],
  ["SIN-2026-0028", "AP-100028", "SEG-0028", date(2026, 9, 11), date(2026, 9, 11), "Assistência", 1250, 0, "DF", "Brasília", 0, 0, false, true, "Aplicativo", "Pneu danificado e atendimento por prestador credenciado.", 0],
  ["SIN-2026-0029", "AP-100029", "SEG-0029", date(2026, 9, 18), date(2026, 9, 19), "Colisão", 33400, 3200, "MG", "Contagem", 1, 1, true, true, "Portal", "Colisão com poste; imagens compatíveis com a dinâmica informada.", 0],
  ["SIN-2026-0030", "AP-100030", "SEG-0030", date(2026, 9, 24), date(2026, 9, 30), "Roubo", 105000, 0, "SP", "Guarulhos", 6, 3, true, false, "Corretor", "Apólice próxima da emissão, múltiplos sinistros e inconsistência de localização.", 1],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Sinistros");
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
sheet.tabColor = "#1F4E78";

sheet.getRange("A1:Q31").values = [headers, ...rows];
sheet.getRange("A1:Q31").format.font = { name: fontFamily, size: 10, color: "#1F2937" };
sheet.getRange("A1:Q1").format = {
  fill: "#1F4E78",
  font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: {
    insideVertical: { style: "thin", color: "#FFFFFF" },
    bottom: { style: "medium", color: "#163A5C" },
  },
};
sheet.getRange("A1:Q1").format.rowHeight = 34;
sheet.getRange("A2:Q31").format.rowHeight = 28;
sheet.getRange("D2:E31").format.numberFormat = "dd/mm/yyyy";
sheet.getRange("G2:H31").format.numberFormat = '"R$" #,##0.00';
sheet.getRange("K2:L31").format.numberFormat = "0";
sheet.getRange("Q2:Q31").format.numberFormat = "0";
sheet.getRange("D2:E31").format.horizontalAlignment = "center";
sheet.getRange("I2:I31").format.horizontalAlignment = "center";
sheet.getRange("K2:O31").format.horizontalAlignment = "center";
sheet.getRange("Q2:Q31").format.horizontalAlignment = "center";
sheet.getRange("P2:P31").format.wrapText = true;
sheet.getRange("A2:Q31").format.verticalAlignment = "center";

const table = sheet.tables.add("A1:Q31", true, "TabelaSinistrosTeste");
table.style = "TableStyleMedium2";
table.showFilterButton = true;
table.showBandedColumns = false;

sheet.getRange("Q2:Q31").conditionalFormats.add("cellIs", {
  operator: "equal",
  formula: 1,
  format: { fill: "#FDE2E2", font: { bold: true, color: "#A61B1B" } },
});
sheet.getRange("Q2:Q31").conditionalFormats.add("cellIs", {
  operator: "equal",
  formula: 0,
  format: { fill: "#E4F4E8", font: { color: "#276738" } },
});

const widths = {
  A: 18, B: 16, C: 14, D: 13, E: 13, F: 19, G: 16, H: 16, I: 9,
  J: 20, K: 14, L: 18, M: 19, N: 14, O: 14, P: 58, Q: 10,
};
for (const [column, width] of Object.entries(widths)) {
  sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}

const summary = await workbook.inspect({
  kind: "table",
  range: "Sinistros!A1:Q8",
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 17,
  maxChars: 9000,
});
console.log("INSPECT_TABLE");
console.log(summary.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log("INSPECT_ERRORS");
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const preview = await workbook.render({
  sheetName: "Sinistros",
  range: "A1:Q12",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/preview_sinistros.png`, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const savedFile = await FileBlob.load(outputPath);
const reopened = await SpreadsheetFile.importXlsx(savedFile);
const savedCheck = await reopened.inspect({
  kind: "table",
  range: "Sinistros!A1:Q31",
  include: "values,formulas",
  tableMaxRows: 4,
  tableMaxCols: 17,
  maxChars: 7000,
});
console.log("INSPECT_SAVED_FILE");
console.log(savedCheck.ndjson);
const savedErrors = await reopened.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "saved file formula error scan",
});
console.log("INSPECT_SAVED_ERRORS");
console.log(savedErrors.ndjson);
const savedPreview = await reopened.render({
  sheetName: "Sinistros",
  range: "A1:Q12",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/preview_sinistros.png`, new Uint8Array(await savedPreview.arrayBuffer()));
console.log(`OUTPUT=${outputPath}`);
