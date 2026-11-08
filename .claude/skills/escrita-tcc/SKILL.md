---
name: escrita-tcc
description: Escrita da monografia do TCC (FraudGuard, UNIP): citações 2019+ conferidas, referências em ABNT, revisão e redação de seções fiéis à branch homolog. Use em pedidos sobre o manuscrito, citações ou referências.
---

# /escrita-tcc

Pedido do usuário:

```text
$ARGUMENTS
```

Responda e escreva sempre em português do Brasil. Estas regras valem para toda
conversa sobre a parte escrita do TCC (o manuscrito), mesmo quando o pedido não
começar com `/escrita-tcc`. Se o pedido estiver vazio, pergunte em que parte do
manuscrito trabalhar e pare.

## Escolher o modo

| O pedido | Modo |
| --- | --- |
| Pede fonte, citação ou "onde achar" para um trecho, tema ou afirmação | **A. Buscar citações** |
| Fala da lista de referências, de ABNT ou de conferir referências | **B. Revisar referências** |
| Pede para revisar, atualizar ou comparar um capítulo ou seção | **C. Revisar seção** |
| Pede texto novo ou reescrita de um trecho | **D. Redigir** |
| Outra dúvida sobre a escrita | Responda seguindo as regras abaixo |

Desde 24/10/2026 (pedido do Pedro): entregue só avaliação e sugestões de como
alterar, sem frases ou parágrafos prontos para colar. Referência pronta em ABNT
pode ir, porque não é texto do trabalho. O modo D só quando ele pedir texto de
novo.

## 1. Antes de qualquer modo

1. **Texto base.** Use a versão mais recente da monografia (docx). No projeto
   do TCC no Claude, os anexos ficam em `/mnt/project-files/uploads/hearth/`
   (arquivos sem extensão; `file` mostra o tipo; para ler,
   `pandoc -f docx -t plain`). A versão de 28/09/2026 é
   `3fdbb1f5-1708-43be-ae46-314a0753337e`. No Claude Code do notebook, peça o
   caminho do docx. Diga sempre qual versão usou. Se o pedido citar um trecho
   que não bate com ela, peça a versão nova antes de revisar.
2. **Projeto.** Vale a branch `homolog` do repositório MizeraviDoSertao/TCC (no
   notebook do Pedro, `C:\TCC\unip-tcc-main`; confira com `git status` e
   `git log -1 --oneline` que a cópia está na `homolog` atualizada). Leia
   `docs/REGRAS_DO_PROJETO.md` (inclusive "Conferência com o código"),
   `docs/OBJETIVO_DO_SISTEMA.md`, `docs/ARQUITETURA_DO_SISTEMA.md` e o README
   do módulo do assunto. Sem acesso ao repositório, use o retrato da seção 4 e
   avise que ele é de 19/10/2026.
3. **Trabalho já feito.** Veja `/mnt/project-files/revisao/` (revisões por
   capítulo, com a data no nome) e
   `/mnt/project-files/revisao/referencias-verificadas.md` (referências já
   conferidas, prontas em ABNT). Parta da revisão mais recente do capítulo e
   não confira de novo o que já está conferido. Essas pastas só existem no
   projeto do TCC no Claude; no notebook, siga sem elas e avise o usuário.

## 2. Regras de citação (do orientador)

1. **Ano 2019 ou mais recente**, obrigatório em toda a monografia. Conta o ano
   da publicação ou da edição usada.
   - Lei, norma técnica e página do dataset não são fonte científica e podem
     ficar (ex.: Lei 13.709/2018, LGPD).
   - Obra que criou uma técnica (ex.: Breiman, 2001, Random Forest; Chawla et
     al., 2002, SMOTE): prefira um artigo ou dissertação de 2019+ que
     descreva a técnica. Citar o original é exceção que o grupo confirma com o
     orientador; nunca use sem avisar.
2. **Brasileira é preferível, não obrigatória.** Procure primeiro em português;
   se a melhor fonte for estrangeira, use a estrangeira. Não troque uma fonte
   boa por uma brasileira fraca só pela nacionalidade.
3. **Nada inventado.** Toda fonte sugerida é conferida na web na própria
   conversa: na página da revista ou do evento, pelo DOI ou em índice confiável
   (SciELO, SBC OpenLib, Portal CAPES, Google Acadêmico). Confira autores e
   ordem, título, ano, veículo, volume, número, páginas e DOI ou URL. Não
   conseguiu conferir: não sugira, ou marque **não conferida** com o motivo.
   Nunca cite de memória.
4. **A fonte sustenta a frase.** Leia ao menos o resumo (e o trecho, quando
   houver número ou citação direta) e confira que a fonte diz o que a frase
   afirma. Número tirado de fonte vai com página ou seção.
5. **Tipo de fonte, em ordem de preferência:** artigo de revista ou de evento
   revisado por pares; dissertação ou tese; relatório oficial (CNseg, SUSEP,
   IBGE); TCC; documentação técnica ou blog, só para descrever uma ferramenta
   (ex.: documentação do Kafka ou do Spring). Não use Wikipédia, ferramenta de
   IA nem material sem autor e sem data.
   **Varie os tipos** (pedido do Pedro, 24/10/2026: lista só de artigos
   parece trabalho feito por IA). Além dos artigos, procure dissertações e
   teses, relatórios e normas do setor. Cada fonte entra porque sustenta uma
   frase, nunca só para variar.
   **Evite livros** (pedido do Pedro, 24/10/2026: são difíceis de resumir e de
   explicar na apresentação). Só sugira livro quando nenhum artigo ou
   dissertação servir, e avise que é livro.
6. **Evite apud.** Procure o original; se ele for anterior a 2019, procure uma
   fonte recente.
7. **Texto e lista batem.** Toda citação no texto tem entrada na lista de
   referências e vice-versa, com o mesmo sobrenome e o mesmo ano.

## 3. Formato ABNT

Referências pela NBR 6023:2018; citações pela NBR 10520.

**Citação no texto**
- A monografia usa o padrão da NBR 10520:2002: sobrenome em maiúsculas dentro
  dos parênteses, `(BRANDT; VIDOTTI, 2020)`, e só a inicial maiúscula fora,
  `Brandt e Vidotti (2020)`. A NBR 10520:2023 usa maiúsculas e minúsculas
  também dentro: `(Brandt; Vidotti, 2020)`. Siga o padrão que o texto já usa e
  não misture os dois; se o orientador ou a UNIP pedir o de 2023, troque no
  texto inteiro de uma vez.
- Até três autores: todos, separados por ponto e vírgula dentro dos
  parênteses. Quatro ou mais: primeiro autor e `et al.`
- Mesmo autor e mesmo ano: `2020a`, `2020b`.
- Citação direta de até 3 linhas: entre aspas, com página,
  `(SOBRENOME, 2020, p. 15)`. Mais de 3 linhas: bloco recuado, fonte menor,
  espaço simples, sem aspas. Prefira a paráfrase (citação indireta). Tradução
  feita pelo grupo: acrescente `tradução nossa` na chamada.

**Lista de referências**
- Uma entrada por obra, sem repetição, em ordem alfabética pelo sobrenome.
- Sobrenome com partícula entra pelo sobrenome: `SILVA, H. A. B. da`, e não
  `DA SILVA`.
- Um só padrão de prenome (por extenso ou abreviado) na lista inteira.
- Autor institucional: a entrada começa pela forma que a chamada usa, por
  extenso ou sigla (ex.: entrada `CNSEG.` para a chamada `(CNSEG, 2024)`).
- Nome da revista ou dos anais em negrito.
- Documento on-line: `Disponível em: URL. Acesso em: 19 out. 2026.` Mês
  abreviado: jan., fev., mar., abr., maio, jun., jul., ago., set., out., nov.,
  dez. DOI sempre que houver.
- Evento: `In: NOME DO EVENTO, número., ano, local. **Anais** [...]. Cidade:
  Editora, ano. p. x-y.`
- Sem data no documento: data provável entre colchetes, como `[2021?]`.
- Dataset do Kaggle: autor e título como aparecem na página, ano da versão,
  `Disponível em:` e `Acesso em:`.

**Figuras e tabelas:** título acima (`Figura 1 – ...`), fonte abaixo
(`Fonte: elaborado pelos autores (2026)` ou a referência de onde veio).

## 4. O que o texto pode afirmar sobre o sistema

Vale o código da `homolog`, não a intenção (regra do `plano.md` e das Regras do
Projeto). Antes de escrever que o sistema faz algo, ache o arquivo que mostra
isso. Sem arquivo, não escreva; se for desejo do grupo, vai para Trabalhos
Futuros.

**Retrato em 19/10/2026 (homolog, commit `0d0a9cb`).** Confira no repositório
antes de usar.
- Sistema FraudGuard: recebe planilhas de sinistros (CSV, XLS, XLSX). API em
  Java 21 com Spring Boot e importação em lotes (Spring Batch). PostgreSQL em
  camadas Bronze, Silver e Gold, com colunas dinâmicas (JSONB), quarentena de
  linhas inválidas e recusa de arquivo repetido (SHA-256). Apache Kafka entre a
  API e o serviço de aprendizado de máquina em Python. Painel em Angular
  (Painel, Sinistros, detalhe da transação, Modelos). Tudo sobe com Docker
  Compose.
- Modelo do sistema: Random Forest com peso de classe (`balanced_subsample`),
  divisão estratificada 75/25 e depois reajuste com todas as linhas, limiar
  fixo de 0,5. Base sem a coluna de fraude: Isolation Forest, com o resultado
  tratado como risco de anomalia e revisão humana. Treinar e ativar modelo é
  ação de administrador. A decisão final sobre o sinistro é do analista.
- O campo `reasons` traz as 3 variáveis mais importantes do modelo inteiro,
  iguais para todo sinistro.
- A comparação de modelos (Regressão Logística, Árvore de Decisão e Random
  Forest, cada um sem balanceamento, com peso de classe e com SMOTE; base bruta
  x tratada; limiar escolhido no treino; matriz de confusão, curvas ROC e PR)
  existe só no experimento do cap. 4 (`/mnt/project-files/experimentos/`, fora
  do repositório). Em 19/10 ainda não tinha rodado no fraud_oracle.

**Bases de dados (decisão do grupo em 06/10/2026)**
- fraud_oracle (Kaggle; 15.420 sinistros, 33 colunas, cerca de 6% de fraude):
  avaliação dos modelos no cap. 4.
- Base sintética criada pelo grupo a partir da estrutura do fraud_oracle: só
  demonstração do sistema ponta a ponta, descrita como sintética na
  metodologia.
- Nunca escreva que um resultado da base sintética vem do fraud_oracle.

**Não afirmar como existente** (não está na homolog ou está fora do escopo das
Regras):
- IA generativa por sinistro (Ollama) e o fallback dela.
- Explicação ou evidência individual por sinistro.
- Remoção automática de identificadores pelo sistema (só o experimento remove
  PolicyNumber e RepNumber).
- SMOTE, Regressão Logística ou Árvore de Decisão dentro do sistema.
- Streamlit, Power BI, SHAP e processamento em tempo real.
- Gráficos novos do painel, enquanto não forem implementados.

Se um desses itens aparecer na homolog, ele passa a valer: diga ao grupo e
atualize a Conferência das Regras do Projeto.

**Números.** Métrica, contagem ou tempo só de saída real (arquivo do
experimento, consulta ao banco, log), dizendo de onde veio. Enquanto não
houver, escreva `[RESULTADO PENDENTE: o que falta]`. Nunca estime.

## 5. Estilo

- Formal e impessoal: "este trabalho propõe", "foi desenvolvido". Sem primeira
  pessoa.
- Passado só para o que estiver pronto na entrega. O que ainda não rodou fica
  no presente ou no futuro.
- Números no padrão brasileiro: vírgula decimal (0,47), ponto no milhar
  (15.420), `6%`.
- Sigla por extenso na primeira vez: "Lei Geral de Proteção de Dados (LGPD)".
- Termo estrangeiro em itálico (*machine learning*, *dataset*), menos nomes de
  ferramentas e técnicas (Random Forest, Apache Kafka, PostgreSQL). Prefira o
  termo em português quando houver: "aprendizado de máquina", "base de dados".
- O mesmo nome para a mesma coisa no texto todo (ex.: sempre "camada Gold",
  sempre "peso de classe").
- Frase que precisa de fonte e ainda não tem: marque `[FONTE?]` em vez de
  inventar.

## 6. Estrutura (Template 2 da UNIP)

Resumo e Abstract; 1 Introdução (1.1 Problematização / Motivação, 1.2 Objetivo
Geral, 1.3 Objetivo Específico, 1.4 Metodologia, 1.5 Organização do Texto);
2 Revisão de literatura; 3 Material e métodos; 4 Resultados; 5 Discussão;
6 Conclusão (6.1 Trabalhos Futuros); Referências. Referências não são
capítulo.

## 7. Onde buscar

| Onde | Para quê |
| --- | --- |
| Google Acadêmico (scholar.google.com.br) | Ponto de partida do usuário. Filtro "Desde 2019"; "Citado por" acha trabalhos novos que citam um antigo (bom para trocar fonte anterior a 2019); "Citar" dá o ABNT, mas sempre confira. O Claude não acessa (o Google bloqueia acesso automatizado): o usuário busca e manda títulos ou links, e o Claude confere. |
| OpenAlex (openalex.org) | Catálogo aberto de artigos; o substituto do Google Acadêmico para o Claude. Filtra por ano e idioma, ordena por citações e tem "citado por". Pega menos literatura cinzenta (TCCs, PDFs soltos) e conta menos citações que o Google Acadêmico. |
| Portal de Periódicos CAPES | IEEE, Elsevier, Springer e outras, pelo acesso CAFe da instituição (só o usuário). |
| SBC OpenLib (sol.sbc.org.br) | Computação no Brasil, revisado por pares: ENIAC, BRACIS, KDMiLe, SBBD. |
| SciELO Brasil | Revistas brasileiras: seguros, fraude, gestão e governança de dados. |
| BDTD e Oasisbr (IBICT) | Dissertações e teses brasileiras. |
| CNseg e SUSEP | Números oficiais do setor de seguros. |
| IEEE Xplore, ACM DL, ScienceDirect | Artigos estrangeiros (muitos abrem pelo Portal CAPES). |

Termos que funcionam:
- Português: "detecção de fraude" seguro automóvel "aprendizado de máquina";
  "desbalanceamento de classes" SMOTE; "qualidade de dados" governança;
  "random forest" fraude.
- Inglês: "insurance fraud detection" "machine learning"; "vehicle insurance
  claim fraud"; "imbalanced data" SMOTE "class weight"; "data quality" "fraud
  detection".

Para organizar as fontes: Zotero (gratuito), que gera a lista em ABNT no Word.

### Como o Claude busca

Testado em 24/10/2026. Use WebFetch e WebSearch (no projeto do TCC no Claude,
`curl` pelo terminal é bloqueado para esses sites). Anote cada busca (base,
termos, filtros, data) para a lista "Fontes consultadas" (seção 9).

1. **SBC OpenLib.** A busca geral do site falha. Busque por evento com
   WebFetch em `https://sol.sbc.org.br/index.php/<evento>/search/search?query=<termos>`
   (funcionou com `eniac`, `sbbd` e `sbsi`; o nome do evento é o que aparece no
   endereço dos artigos dele). Para cobrir todos os eventos de uma vez, ou se
   o evento der erro, use WebSearch com `allowed_domains: ["sol.sbc.org.br"]`.
2. **OpenAlex**, com WebFetch na API:
   - busca: `https://api.openalex.org/works?search=<termos>&filter=from_publication_date:2019-01-01,language:pt&sort=cited_by_count:desc&per-page=10&select=id,display_name,publication_year,doi,cited_by_count`
     (tire `,language:pt` para incluir as estrangeiras);
   - por DOI: `https://api.openalex.org/works/doi:<DOI>?select=id,display_name,publication_year,cited_by_count`;
   - "citado por": `https://api.openalex.org/works?filter=cites:<id>,from_publication_date:2019-01-01&select=display_name,publication_year,doi`,
     com o `<id>` (W...) da fonte antiga; serve para trocar fonte anterior a
     2019 por uma nova sobre o mesmo assunto.
3. **SciELO.** O buscador do site bloqueia ferramentas; use WebSearch com
   `allowed_domains: ["scielo.br"]`.
4. **Dissertações e teses.** No OpenAlex, troque o filtro por
   `filter=type:dissertation,from_publication_date:2019-01-01,language:pt`
   (traz USP, FGV e outras). A BDTD bloqueia ferramentas; use WebSearch com
   `allowed_domains: ["bdtd.ibict.br", "teses.usp.br", "repositorio.usp.br"]`
   e abra o PDF no repositório da universidade. O OpenAlex chama de
   "dissertation" também monografia de especialização ou MBA: confira o tipo
   na capa.
5. **Google Acadêmico e Portal CAPES** ficam com o usuário. Quando ele mandar
   títulos ou links, confira cada um pelo passo 6.
6. **Conferir antes de sugerir** (regras 2.3 e 2.4). Os dados da referência
   (autores, título, veículo, volume, páginas, ano) pelo Crossref, com
   WebFetch em `https://api.crossref.org/works/<DOI>`; o conteúdo na página do
   artigo ou no PDF. OpenAlex e Crossref não dizem se a fonte sustenta a frase.

## 8. Modos

### A. Buscar citações

1. Separe as afirmações do trecho que precisam de fonte (dado, definição,
   afirmação sobre o setor ou sobre uma técnica). Afirmação sobre o próprio
   sistema não leva citação; leva evidência no código (seção 4).
2. Veja se `referencias-verificadas.md` ou a lista atual da monografia já tem
   uma fonte 2019+ que sirva.
3. Busque pelo roteiro "Como o Claude busca" (seção 7), primeiro em
   português. Confira cada candidata pelas regras 2.3 e 2.4.
4. Entregue uma tabela: afirmação | fonte | ano | tipo | brasileira ou
   estrangeira | link | conferida ou não conferida. Depois, a referência pronta
   em ABNT e a forma de citar no texto.
5. Acrescente as fontes conferidas em `referencias-verificadas.md`.

### B. Revisar referências

Confira a lista inteira e o texto: entradas repetidas; anteriores a 2019, com
sugestão de troca; sem autor, ano, `Disponível em` ou `Acesso em`; formato fora
da seção 3; ordem alfabética; citação no texto sem referência e referência que
o texto não cita (extraia as chamadas do texto com uma expressão regular e
compare com a lista); mistura de tipos de fonte (regra 2.5). Entregue agrupado
por tipo de problema, com a correção pronta.

### C. Revisar seção

Compare a seção com o projeto (seção 4) e com estas regras. Para cada
subseção: **Manter**, **Modificar**, **Acrescentar** e **Retirar**, cada item
com o porquê e o arquivo que comprova. Termine com "O que não colocar", quando
couber, e a tabela de correções de texto (onde | hoje | sugestão). Modelo:
`/mnt/project-files/revisao/cap1-o-que-mudar-v2-2026-10-24.md`.

### D. Redigir

Escreva como proposta para o grupo, no estilo da seção 5, só com fatos da
seção 4 e fontes conferidas. Marque `[FONTE?]` e `[RESULTADO PENDENTE]` onde
faltar. Liste ao final as fontes usadas e o arquivo de onde veio cada fato do
sistema. O texto é do grupo: não altere o docx sem pedido.

## 9. Como entregar

- Resposta curta no chat. O que passar de 15 linhas vai em arquivo.
- No projeto do TCC no Claude: `/mnt/project-files/revisao/<assunto>-AAAA-MM-DD.md`
  (ex.: `cap2-citacoes-2026-10-20.md`), anexado na resposta. Fora dele: no
  chat ou na pasta que o usuário indicar.
- Toda afirmação sobre o projeto leva a evidência (arquivo da homolog, revisão
  anterior ou saída do experimento). Inferência é dita como inferência.
- No fim de cada arquivo, a lista "Fontes consultadas" com os links abertos e
  as buscas feitas (base, termos, filtros, data).

## 10. Regra nova

Quando o orientador ou o grupo der uma regra nova de escrita ou de citação,
proponha a versão atualizada desta skill e registre a regra na memória do
projeto, com a data e quem pediu.
