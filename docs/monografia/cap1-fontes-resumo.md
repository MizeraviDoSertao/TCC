# Fontes do capítulo 1: o que cada uma diz e até onde ela sustenta o texto

> Conferência feita em 08/11/2026, abrindo cada fonte pelo link, para a versão do capítulo 1 em `revisao/cap1-reescrito-2026-11-08.md` (citação no fim de cada parágrafo).
>
> **Regra do orientador (08/11/2026, 12h):** "Não é necessário repetir no fim do parágrafo, se vc já citou durante a sua escrita. Só adiciona no final, quando não citar nenhum autor no parágrafo." Ou seja: a fonte pode ficar no meio da frase que ela sustenta; a chamada no fim só entra no parágrafo que não citou ninguém.
>
> **Como usar:** cada fonte tem um resumo, o trecho do capítulo em que ela aparece e a pergunta "ela sustenta o que o trecho afirma?". Quando a fonte está no fim do parágrafo, a pergunta vale para o parágrafo inteiro. O campo **Alcance** diz até onde a fonte pode ir: só aquela frase, a seção ou outros capítulos. Onde a resposta é não, está indicado o que fica descoberto e o que fazer.
>
> **Legenda:** ✅ cobre o parágrafo · ⚠️ cobre em parte (ajustar uma frase ou acrescentar fonte) · ❌ não cobre · 🔒 não abriu hoje.
>
> **O que foi lido:** texto completo, salvo onde está escrito "só o resumo". Os sites da USP bloqueiam leitura automática, o portal da UFPB está em manutenção até 12/11/2026, e Bello et al. não foi encontrado em nenhuma base aberta.

---

## Quadro geral

| # | Fonte | Onde está no cap. 1 | Cobre? | O que fazer |
|---|---|---|---|---|
| 1 | KUMAR; SOUNTHARRAJAN, 2025 | Fim da abertura §1 | ⚠️ | Tirar "pesa diretamente na estabilidade econômica" e "clientes fiéis", ou deixá-los como frase do grupo |
| 2 | LOPES; CARVALHO, 2022 | Meio da abertura §2 | ✅ | — |
| 3 | CNSEG, 2024 | Fim da abertura §2 | ✅ | — |
| 4 | ALI et al., 2022 | Fim da abertura §3 | ✅ | Opcional: dizer que é uma revisão sobre fraude financeira |
| 5 | NICOLA; LAURETTO; VALDIVIA DELGADO, 2020 | Meio da abertura §4 | ✅ | Opcional: dizer que é fraude em cartão de crédito |
| 6 | RODRIGUES, 2025 | Fim da abertura §4, do 1.1 §3 e do 1.4 §4 | ✅ / ⚠️ | Revisar a diferença entre o trabalho dele e o de vocês (1.1 §3) |
| 7 | BRANDT; VIDOTTI, 2020 | Fim da abertura §5 | ⚠️ 🔒 | Trocar "padrões e controles" por "mapear, organizar, documentar e gerir os dados"; conferir o ano |
| 8 | DATABRICKS, 2024 | Meio da abertura §6 | ✅ | Ano da página é 2026 |
| 9 | PATIL et al., 2025 | Meio do 1.1 §2 | ✅ | Fonte fraca; considerar só Ali et al. |
| 10 | WHANG et al., 2023 | Fim do 1.1 §2 | ⚠️ | Trocar "etapa necessária" por "prática comum" |
| 11 | FARIAS, 2021 | Meio do 1.1 §3 | ✅ | Opcional: dizer que é precificação de prêmio |
| 12 | GUERRA, 2024 | Fim do 1.4 §1 | ⚠️ | "Pesquisa aplicada" fica sem fonte |
| 13 | BELLO et al., 2023 | Fim do 1.4 §2 | 🔒 | Conferir por vocês ou trocar |
| 14 | BANSAL, 2021 | Meio do 1.4 §3 | ✅ | — |
| 15 | DASGUPTA, 2019 | Fim do 1.4 §3 | ⚠️ | Cobre só a frase final; o resto do parágrafo é do grupo |
| 16 | ÖZALTIN; KARADAĞ ERDEMIR, 2025 | Meio do 1.4 §4 | ✅ | Usa a mesma base |
| 17 | CRISTOVÃO, 2023 | Fim do 1.4 §5 | ✅ 🔒 | Conferido no PDF em 24/10; hoje só o resumo abriu |
| 18 | MOLINA, 2022 | Fim do 1.4 §6 | ❌ | Não fala de revisão humana nem de seguros; tirar do fim do parágrafo |
| 19 | MOHAMMED et al., 2025 | Fim do 1.4 §8 | ✅ | — |

**Resumo:** 11 fontes cobrem o parágrafo que fecham. Seis pedem ajuste de uma frase (Kumar, Rodrigues no 1.1 §3, Brandt e Vidotti, Whang, Guerra e Dasgupta). Molina não serve para fechar o parágrafo do sistema. Bello não pôde ser conferido.

---

## Abertura

### 1. KUMAR; SOUNTHARRAJAN, 2025

- **Referência:** KUMAR, P. A.; SOUNTHARRAJAN, S. Insurance claims estimation and fraud detection with optimized deep learning techniques. **Scientific Reports**, v. 15, art. 27296, 2025. DOI: 10.1038/s41598-025-12848-0.
- **Link lido:** https://pmc.ncbi.nlm.nih.gov/articles/PMC12297633/ (texto completo no PubMed Central; a página da Nature não abriu).
- **O que é:** artigo de pesquisa experimental (Índia).
- **Objetivo:** propor uma rede neural convolucional de 12 camadas, com hiperparâmetros ajustados por um algoritmo de otimização (EHOA), para detectar fraude em sinistros.
- **Dados e método:** 1.500 **imagens** de danos em carros (farol, amassado na porta, vidro quebrado, lanterna e "desconhecido"), comparando VGG16, VGG19, ResNet50 e duas CNNs próprias.
- **Conclusões:** o modelo proposto chega a 92% de acurácia e supera os modelos de comparação. Os próprios autores apontam que usaram uma única base, pequena.
- **O que sustenta:**
  - "With accurate estimation of insurance claims, insurers can have good risk perceptions" e pagar as indenizações no prazo (resumo).
  - "The claims are usually exaggerated, falsified, or intentionally misrepresented" (introdução).
  - "fraudulent claims cause great financial losses every year" (introdução).
  - A fraude "increases premiums for policyholders" (introdução).
- **O que não sustenta:** a "estabilidade econômica das organizações" (o artigo fala da estabilidade dos mercados de capitais, por fraude financeira em geral) e "clientes fiéis" (fala só dos segurados em geral).
- **Cobre a abertura §1?** ⚠️ Em parte. Ajuste sugerido: "pesa diretamente na estabilidade econômica das organizações, pois" sai, ou fica como frase do grupo; "até mesmo os clientes fiéis" vira "os segurados".
- **Alcance:** só a contextualização (sinistro, fraude, prêmio). A base dele é de imagens, então não serve para o método nem para comparar resultados com os de vocês.

### 2. LOPES; CARVALHO, 2022

- **Referência:** LOPES, B. P.; CARVALHO, J. V. F. Pagando pelo crime: fraudes no seguro DPVAT e seus impactos à sociedade. **BBR. Brazilian Business Review**, v. 19, n. 6, p. 666-684, 2022. DOI: 10.15728/bbr.2022.19.6.5.pt.
- **Link lido:** https://www.scielo.br/j/bbr/a/BYQrQVhdPKy7ywBNdMCFWRN/?lang=pt
- **O que é:** artigo empírico quantitativo (USP), com dados públicos da SUSEP de 2006 a 2020.
- **Objetivo:** medir o peso das fraudes no DPVAT e quanto os segurados pagam a mais por causa delas.
- **Método:** compara a sinistralidade do DPVAT com a de ramos privados de automóvel usando prêmios de credibilidade (modelo de Bühlmann-Straub) e simula o prêmio sem fraudes.
- **Conclusões:** sem as fraudes, "não apenas a sinistralidade do produto teria sido reduzida, como também o preço repassado aos segurados" (resumo). O prêmio estatístico do DPVAT cairia cerca de 25,9%, e a sociedade teria economizado mais de R$ 15 bilhões em 14 anos.
- **Cobre a frase em que aparece?** ✅ Sim. Ressalva: é uma estimativa do modelo dos autores, não um valor observado.
- **Alcance:** contextualização no Brasil e o argumento de que a fraude encarece o seguro. Poderia sustentar também a frase do Kumar sobre prêmios, com fonte brasileira.

### 3. CNSEG, 2024

- **Referência:** CNSEG. **22º Ciclo SQF – 2024**: quantificação da fraude no mercado de seguros brasileiro: relatório parcial, 1º semestre de 2024. Rio de Janeiro: CNseg, 2024.
- **Links lidos:** https://cnseg.org.br/publicacoes/22-ciclo-do-sqf-1-semestre-de-2024 e o PDF do relatório (24 páginas).
- **O que é:** relatório estatístico do setor, com dados declarados pelas seguradoras.
- **Conteúdo principal:**
  - p. 4: no mercado todo, R$ 2,3 bilhões em sinistros suspeitos (12% dos sinistros) e R$ 504 milhões em fraudes comprovadas (21,9% dos suspeitos).
  - p. 7, tabela do ramo automóvel, 1º semestre de 2024: R$ 1.882,66 milhões suspeitos (14,4%) e R$ 331,44 milhões comprovados (2,5%).
  - p. 22: definições. "Sinistro suspeito" tem características típicas de fraude; "fraude comprovada" é a que a seguradora comprovou e negou o sinistro.
- **Cobre a abertura §2?** ✅ Sim. A conta "menos de um quinto" confere: 331,44 ÷ 1.882,66 = 17,6%.
- **Alcance:** contextualização e o argumento de que suspeita não é fraude (definições da p. 22), que sustenta a decisão de o sistema não acusar. O relatório não fala do custo da fraude para o segurado.

### 4. ALI et al., 2022

- **Referência:** ALI, A. et al. Financial fraud detection based on machine learning: a systematic literature review. **Applied Sciences**, v. 12, n. 19, art. 9637, 2022. DOI: 10.3390/app12199637.
- **Link lido:** https://www.mdpi.com/2076-3417/12/19/9637
- **O que é:** revisão sistemática da literatura, com 93 estudos de 2010 a 2021 (a conclusão diz 87; a divergência é do próprio artigo).
- **Objetivo:** mapear as técnicas de aprendizado de máquina usadas na detecção de fraude financeira, as métricas e as lacunas.
- **Conclusões:** SVM e redes neurais são os mais usados; cartão de crédito é o tipo de fraude mais estudado; fraude em seguros (saúde e automóvel) aparece pouco (21% dos estudos, junto com outros tipos).
- **O que sustenta:**
  - "Conventional techniques such as manual verifications and inspections are imprecise, costly, and time consuming" (resumo).
  - "The problem of imbalanced data distribution generally affects the efficiency of machine learning models" (seção 3.2.4).
  - "the accuracy of the algorithms diminishes. This phenomenon is called concept drift" (seção 3.2.4).
- **Cobre a abertura §3?** ✅ Sim, os três obstáculos.
- **Alcance:** desafios da detecção, em qualquer parte do trabalho. Ressalva: trata de fraude financeira em geral, com seguros como uma das categorias.

### 5. NICOLA; LAURETTO; VALDIVIA DELGADO, 2020

- **Referência:** NICOLA, V.; LAURETTO, M.; VALDIVIA DELGADO, K. Avaliação empírica de classificadores e métodos de balanceamento para detecção de fraudes em transações com cartões de créditos. *In*: ENIAC, 17., 2020. **Anais** [...]. Porto Alegre: SBC, 2020. p. 70-81. DOI: 10.5753/eniac.2020.12118.
- **Link lido:** https://sol.sbc.org.br/index.php/eniac/article/view/12118 (só o resumo; o corpo do artigo não veio).
- **O que é:** artigo de evento brasileiro (USP), estudo comparativo.
- **Objetivo:** comparar cinco classificadores sob cinco métodos de balanceamento.
- **Conclusões:** "O melhor desempenho foi obtido pela random forest" (F1 médio de 0,867), que também foi a mais robusta à escolha do método de balanceamento (resumo).
- **Cobre a frase em que aparece?** ✅ Sim. Ressalva: a base é de cartão de crédito, não de seguro.
- **Alcance:** justificar a comparação de balanceamentos e o Random Forest no sistema. Serve também para os caps. 4 e 5.

### 6. RODRIGUES, 2025

- **Referência:** RODRIGUES, E. B. **Detecção de fraudes em seguros automotivos com aprendizado de máquina e inteligência artificial explicável (XAI)**. 2025. 85 p. Monografia (MBA em Inteligência Artificial e Big Data) – ICMC, USP, São Carlos, 2025. DOI: 10.11606/003291891.
- **O que foi lido:** hoje, só o resumo (OpenAlex); o site da USP bloqueia leitura automática. As páginas 44 e 45 foram conferidas no PDF em 24/10.
- **O que é:** monografia de MBA da USP.
- **Objetivo:** "propõe e avalia um sistema de detecção de fraudes automotivos baseado em aprendizado de máquina", sob três aspectos: desempenho preditivo, viabilidade econômica e interpretabilidade.
- **Dados e método:** "Fraud Oracle Dataset (15,420 registros, 33 variáveis e cerca de 6% fraudes)", a mesma base de vocês. Usa Isolation Forest para criar atributos, reamostragem baseada em SMOTE (só no treino, p. 45), Gradient Boosting e Random Forest, ajuste de hiperparâmetros com Optuna, ajuste do limiar e SHAP.
- **Conclusões:** o modelo escolhido é CatBoost com SMOTEENN; os modelos de boosting superam os de comparação; a variável de culpa do segurado é a mais importante.
- **Cobre os parágrafos?**
  - Abertura §4 (6% de fraude, p. 44): ✅
  - 1.4 §4 (SMOTE só no treino, p. 45): ✅
  - 1.1 §3: ⚠️ O resumo diz que ele também propõe "um sistema". A diferença com o trabalho de vocês continua existindo, mas é outra: o "sistema" dele é o fluxo de modelagem (modelo, custo e explicação), e o de vocês é um software que recebe planilhas, guarda os dados em camadas e mostra os resultados num painel. Sugestão: trocar "se concentrou na comparação e na interpretação dos modelos" por algo como "concentrou-se no desempenho, no custo e na explicação dos modelos".
- **Alcance:** é a fonte mais próxima do trabalho todo (mesma base, mesmos problemas). Serve para os caps. 1, 2, 4 e 5, e principalmente para comparar resultados no cap. 5.

### 7. BRANDT; VIDOTTI, 2020

- **Referência:** BRANDT, M. B.; VIDOTTI, S. A. B. G. Arquitetura da informação para processos de negócio: um caminho para a governança de dados. **Informação & Sociedade: Estudos**, v. 30, n. 4, p. 1-16, 2020. DOI: 10.22478/ufpb.1809-4783.2020v30n4.57349.
- **O que foi lido:** só o resumo (OpenAlex). O portal da revista está em manutenção até 12/11/2026. Em 24/10 a fonte já tinha sido conferida.
- **O que é:** artigo teórico (Câmara dos Deputados e Unesp), sem dados empíricos.
- **Objetivo:** propor a "Arquitetura da Informação para Processos de Negócio" como forma de mapear e documentar os dados e metadados dos processos de negócio.
- **Conclusões (resumo):** a governança exige uma estrutura em que os dados sejam "mapeados, organizados, documentados e geridos"; os metadados de negócio viram requisitos de informação para construir sistemas.
- **Cobre a abertura §5?** ⚠️ Em parte. Sustenta a frase sobre governança se ela disser o que o artigo diz ("mapear, organizar, documentar e gerir os dados"), e não "definir padrões e controles". Não fala de qualidade de dados, fraude, identificadores nem valores inválidos: essa parte do parágrafo é dos problemas da própria base (`tratamento.py`) e não precisa de fonte.
- **Ano:** o fascículo é de 2020, mas o OpenAlex registra a publicação em 25/01/2021. Confiram na página da revista depois de 12/11.
- **Alcance:** só governança de dados. Para "qualidade dos dados afeta o modelo", a fonte é Mohammed et al. (2025).

### 8. DATABRICKS, 2024

- **Referência:** DATABRICKS. **What is the medallion lakehouse architecture?** Disponível em: https://docs.databricks.com/aws/en/lakehouse/medallion.
- **Link lido:** o próprio.
- **O que é:** documentação técnica de produto.
- **Conteúdo:** a arquitetura medalhão melhora "progressively [...] the structure and quality of data" de camada em camada. A Bronze guarda dados brutos sem validação; na Silver ficam a limpeza, a validação, a remoção de duplicatas e a aplicação de esquema; a Gold tem visões refinadas para análises e aprendizado de máquina. A própria página diz que é uma boa prática recomendada, não uma obrigação.
- **Cobre a frase em que aparece?** ✅ Sim.
- **Ano:** a página mostra "Last updated on Oct 29, 2026". Pela ABNT, documento on-line usa a data que aparece nele: troquem para DATABRICKS, 2026 no texto e na lista, ou mantenham 2024 se for a data em que vocês a leram (e digam isso no "Acesso em").
- **Alcance:** as camadas Bronze, Silver e Gold em qualquer capítulo, principalmente no cap. 3.

---

## 1.1 Problematização

### 9. PATIL et al., 2025

- **Referência:** PATIL, P. et al. Fraud detection and analysis for insurance claim using machine learning. **International Journal of Advance Scientific Research and Engineering Trends**, v. 9, n. 4, p. 36-42, abr. 2025.
- **Link lido:** https://www.ijasret.com/VolumeArticles/FullTextPDF/1495_2.Faud_Detection_and_Analysis_for_Insurance_Claim_using.pdf (o link da lista de referências de 28/09 tem um erro: "olumeArticles").
- **O que é:** artigo de projeto aplicado (Índia), sem DOI.
- **Objetivo:** detectar fraude em sinistros de seguro com aprendizado de máquina.
- **Método:** cita Regressão Logística, Random Forest, XGBoost e redes neurais em PySpark, mas só mostra os números do Random Forest, e não diz de onde vem a base.
- **Conclusões:** Random Forest com 94,6% de acurácia e recall de 88,3%; a arquitetura proposta tem ETL, limpeza e retorno das decisões dos investigadores para o modelo.
- **O que sustenta:** "Traditional methods of fraud detection, which rely heavily on manual investigation, are often slow and prone to errors" (introdução).
- **Cobre a frase em que aparece?** ✅ Sim.
- **Qualidade da fonte:** baixa. A revisão do artigo tem entradas repetidas e autores trocados, e a conclusão fala de modelos sem mostrar os números. A mesma frase é sustentada por Ali et al. (2022), que é uma revisão sistemática. Sugestão: deixar só Ali, se o orientador não exigir Patil.
- **Alcance:** só essa frase.

### 10. WHANG et al., 2023

- **Referência:** WHANG, S. E. et al. Data collection and quality challenges in deep learning: a data-centric AI perspective. **The VLDB Journal**, v. 32, n. 4, p. 791-813, 2023. DOI: 10.1007/s00778-022-00775-9.
- **Link lido:** https://arxiv.org/abs/2112.06409 (versão do arXiv; a publicada pode ter pequenas diferenças).
- **O que é:** revisão de literatura (Coreia do Sul).
- **Objetivo:** mapear as técnicas de coleta e de qualidade de dados para aprendizado profundo: validação, limpeza, treinamento robusto e justiça.
- **Conclusões:** grande parte do tempo de um projeto de aprendizado de máquina vai para a preparação dos dados; "Schema-based validation is widely used in practice" (seção 3.1); limpar só os erros conhecidos nem sempre melhora o modelo, e às vezes é melhor treinar de forma robusta.
- **Cobre o 1.1 §2?** ⚠️ Em parte. O artigo diz que a validação por esquema é **uma prática comum**, não que é **necessária**. Ajuste: "A validação dos dados contra um esquema esperado é uma prática comum para conferir os dados antes do treinamento dos modelos". Ele não fala de planilhas nem de erros de preenchimento: essa frase é argumento do grupo.
- **Alcance:** qualidade e validação de dados, nos caps. 2 e 3.

### 11. FARIAS, 2021

- **Referência:** FARIAS, T. A. **Aplicação de machine learning em seguros de autos**. 2021. 52 f. Trabalho de Conclusão de Curso (Graduação em Ciências Atuariais) – UFRN, Natal, 2021.
- **O que foi lido:** só o registro no acervo da UFRN (https://acervo.ufrn.br/Record/ri-123456789-44577), com o resumo cortado. O repositório não abriu, e o registro não mostra o autor nem o ano.
- **O que é:** TCC de Ciências Atuariais.
- **Objetivo:** "price the insurance premium value of a vehicle protection association" com Random Forest de regressão.
- **Cobre a frase em que aparece?** ✅ Sim ("aplicam aprendizado de máquina a dados de seguros de automóveis"). Opcional: dizer "para precificar o prêmio". Atenção: não é detecção de fraude, e o objeto é uma associação de proteção veicular.
- **Pendente:** confirmar o autor e o ano no PDF.
- **Alcance:** só essa frase.

---

## 1.4 Metodologia

### 12. GUERRA, 2024

- **Referência:** GUERRA, A. L. R. Metodologias e classificação das pesquisas científicas. **RECIMA21**, v. 5, n. 8, e585584, 2024. DOI: 10.47820/recima21.v5i8.5584.
- **Link lido:** https://recima21.com.br/recima21/article/download/5584/3830/33469 (PDF).
- **O que é:** artigo de revisão bibliográfica sobre metodologia.
- **Conteúdo:** define pesquisa exploratória, descritiva, explicativa, bibliográfica, documental, experimental, qualitativa e quantitativa, e a combinação das duas abordagens. Diz que "No contexto do trabalho de conclusão de curso, o nível da pesquisa é geralmente exploratório" (p. 6).
- **Cobre o 1.4 §1?** ⚠️ Em parte. Sustenta as definições de pesquisa qualitativa e quantitativa, descritiva e exploratória. **Não define pesquisa aplicada**: essa palavra não aparece no artigo. A classificação do trabalho de vocês é decisão do grupo, apoiada nas definições.
- **O que fazer:** achar uma fonte para "pesquisa aplicada" ou perguntar ao orientador se Guerra basta (pendência de 24/10).
- **Alcance:** só a classificação da pesquisa.

### 13. BELLO et al., 2023

- **Referência (da lista de 28/09):** BELLO, O. A. et al. Analysing the impact of advanced analytics on fraud detection: a machine learning perspective. **European Journal of Computer Science and Information Technology**, v. 11, n. 6, p. 103-126, 2023.
- **O que foi lido:** nada. O ResearchGate não abriu e o artigo não aparece no OpenAlex.
- **Cobre o 1.4 §2?** 🔒 Não foi possível conferir. Também falta confirmar o ano (2023 ou 2024).
- **O que fazer:** abram o PDF que vocês usaram e confiram se ele diz que as técnicas analíticas dependem de dados consistentes e bem estruturados. Se não for possível, Mohammed et al. (2025) sustenta a mesma ideia com uma fonte conferida.

### 14. BANSAL, 2021

- **Referência:** BANSAL, S. **Vehicle Insurance Claim Fraud Detection**. [*S. l.*]: Kaggle, 2021. Disponível em: https://www.kaggle.com/datasets/shivamb/vehicle-claim-fraud-detection.
- **Conferido em 08/11:** título, autor, versão 1 de 20/12/2021, licença CC0 e a coluna de fraude FraudFound_P. A lista de arquivos não abriu.
- **Cobre a frase em que aparece?** ✅ Sim, como origem da base.

### 15. DASGUPTA, 2019

- **Referência:** DASGUPTA, S. **Detecting anomalous insurance claims with hybrid feature optimisation and classification techniques**. 2019. 23 f. Dissertação (MSc in FinTech) – National College of Ireland, Dublin, 2019.
- **Link lido:** https://norma.ncirl.ie/4224/ e o PDF.
- **O que é:** dissertação de mestrado, sem revisão por pares.
- **Objetivo:** encontrar a melhor combinação de seleção de atributos (PSO e Firefly) e classificador (SVM, redes neurais, Naive Bayes, kNN, Random Forest) para identificar sinistros anômalos.
- **Dados e método:** outra base do Kaggle (10.211 sinistros, 39 atributos, cerca de 50% de fraude), com imputação pela moda, normalização, remoção de outliers e divisão 70/30, seguindo o CRISP-DM.
- **Conclusões:** a melhor combinação foi PSO com Random Forest, com 57% de acurácia. A dissertação diz que o pré-processamento é "the most significant step of the data mining process" (p. 10) e que, com dados sem limpeza, "the performance of the classifier would be negatively affected" (p. 3).
- **Cobre o 1.4 §3?** ⚠️ Só a frase final ("a qualidade e o tratamento dos dados influenciam diretamente os resultados das análises"), e de forma geral: o experimento dele não mede esse efeito. O resto do parágrafo (as duas bases e o tratamento) é do próprio trabalho e não precisa de fonte.
- **Alcance:** só essa frase. Mohammed et al. (2025), que mede o efeito, é mais forte para essa ideia.

### 16. ÖZALTIN; KARADAĞ ERDEMIR, 2025

- **Referência:** ÖZALTIN, Ö.; KARADAĞ ERDEMIR, Ö. Detecting automobile insurance fraud using a novel penalty-driven feature selection method with particle swarm optimization and machine learning classifiers. **Scientific Reports**, v. 15, art. 41793, 2025. DOI: 10.1038/s41598-025-25700-2.
- **O que foi lido:** hoje, só o resumo (OpenAlex); a Nature e o PubMed Central bloquearam. Em 24/10 a fonte foi conferida na página da revista.
- **O que é:** artigo experimental (Hacettepe University, Turquia, Departamento de Atuária).
- **Objetivo:** propor uma seleção de atributos com PSO que penaliza atributos muito correlacionados.
- **Dados e método:** "Angoss carclaims dataset, comprising 33 features and 15,420 records", que é a mesma base fraud_oracle. Balanceamento com oversampling sintético (SMOTE). Onze classificadores, entre eles Random Forest, Regressão Logística e Árvore de Decisão.
- **Conclusões:** o Stacking Classifier foi o melhor (97,55% de acurácia, F1 0,9754) com 16 atributos.
- **Cobre a frase em que aparece?** ✅ Sim.
- **Alcance:** mesma base; serve para comparar resultados no cap. 5. Atenção para a banca: uma acurácia de 97% nessa base costuma vir de balancear antes de separar treino e teste. O resumo não diz como eles fizeram; não afirmem isso sem conferir.

### 17. CRISTOVÃO, 2023

- **Referência:** CRISTOVÃO, R. B. **Detecção de fraudes em cartão de crédito**: um caso de uso de modelos supervisionados no e-commerce brasileiro. 2023. Dissertação (Mestrado Profissional) – ICMC, USP, São Carlos, 2023. DOI: 10.11606/d.55.2023.tde-23082023-102023.
- **O que foi lido:** hoje, só o resumo (OpenAlex); a USP bloqueia. Em 24/10 o PDF foi conferido.
- **O que é:** dissertação de mestrado da USP.
- **Objetivo:** comparar algoritmos de previsão de fraude com transações reais de um e-commerce brasileiro e testar a atualização semanal dos modelos (mudança de padrão).
- **Conclusões (resumo):** os modelos de árvore foram os melhores, com destaque para o Gradient Boosting; a atualização semanal melhorou o desempenho e reduziria até 30% dos gastos com chargeback.
- **Cobre o 1.4 §5?** ✅ Pela conferência de 24/10, o texto mostra que, com classes desbalanceadas, classificar tudo como a classe maior dá boa acurácia. O resumo de hoje não confirma nem desmente isso. Ressalva: é cartão de crédito, não seguro.
- **Alcance:** métricas para classes desbalanceadas e mudança de padrão (pode reforçar Ali no cap. 2).

### 18. MOLINA, 2022

- **Referência:** MOLINA, A. L. B. **WEAPON**: uma arquitetura de aprendizado não supervisionado para detecção de anomalias de comportamento de usuários. 2022. Dissertação (Mestrado Profissional em Engenharia Elétrica) – UnB, Brasília, 2022.
- **Link lido:** https://repositorio.unb.br/handle/10482/45317 e o PDF (lido literalmente até cerca da p. 8).
- **O que é:** dissertação de mestrado da UnB, na área de **segurança cibernética**.
- **Objetivo:** propor uma arquitetura de autoencoders para detectar comportamento anômalo de usuários.
- **Dados e método:** base sintética CERT R6.2, com registros de 4.000 usuários; compara com Isolation Forest, OCSVM e outros.
- **Conclusões:** o WEAPON supera o segundo melhor modelo em mais de 4% de ROC AUC e não precisa de dados rotulados.
- **Sustenta o 1.4 §6?** ❌ Não como fonte do parágrafo inteiro. O parágrafo descreve o sistema (Java, PostgreSQL, Kafka, Angular, Docker) e termina dizendo que o resultado sem rótulo é "tratado como risco e encaminhado para revisão humana". Molina não trata de seguros, não fala de risco e não diz que o resultado precisa de revisão humana. Ele só sustenta que a detecção de anomalias funciona sem rótulos, e que o Isolation Forest é uma das técnicas usadas.
- **O que fazer:** pela regra nova, o parágrafo descreve o próprio sistema e não precisa de citação no fim. Ponham Molina no meio da frase: "é empregada uma técnica de detecção de anomalias, que não depende de dados rotulados (MOLINA, 2022)". A revisão humana é decisão do sistema (`scoring.py`), não da fonte.

### 19. MOHAMMED et al., 2025

- **Referência:** MOHAMMED, S. et al. The effects of data quality on machine learning performance on tabular data. **Information Systems**, v. 132, art. 102549, 2025. DOI: 10.1016/j.is.2025.102549.
- **Link lido:** https://arxiv.org/abs/2207.14529 (versão do arXiv).
- **O que é:** estudo experimental (Hasso Plattner Institute, Alemanha).
- **Objetivo:** medir a relação entre seis dimensões de qualidade dos dados e o desempenho de algoritmos de aprendizado de máquina.
- **Método:** pega bases reais, "polui" cada dimensão aos poucos (de 0 a 100%) no treino, no teste ou nos dois, e mede o desempenho em cada nível. O resumo do arXiv fala em 19 algoritmos, e o PDF em 15.
- **Conclusões:** completude e exatidão (dos atributos e do alvo) estão entre as dimensões que mais afetam o desempenho; os resultados são comparados com a versão original dos dados.
- **Cobre o 1.4 §8?** ✅ Sim: é a mesma lógica de comparar a base bruta com a tratada.
- **Alcance:** qualidade de dados e desempenho dos modelos nos caps. 1, 2, 4 e 5. Ao citar o número de algoritmos, usem o da versão publicada.

---

## Como fica o capítulo com a regra nova

A versão atual do capítulo já segue a regra: nenhum parágrafo repete a mesma fonte no meio e no fim, e os parágrafos que citam um autor no meio do texto (Lopes e Carvalho, Nicola et al., Patil et al., Farias, Bansal, Özaltin e Karadağ Erdemir) só têm no fim a fonte de outro fato. Duas mudanças ficam mais fáceis agora:

- **1.4 §6 (o sistema):** Molina pode sair do fim e ir para o meio da frase sobre anomalias ("uma técnica de detecção de anomalias, que não depende de dados rotulados (MOLINA, 2022)"). O parágrafo descreve o próprio sistema e não precisa de citação no fim.
- **1.4 §3 (bases e tratamento):** o parágrafo já cita Bansal no meio. Dasgupta pode ficar só na frase final, como está, ou sair, se o grupo preferir Mohammed para essa ideia.

Os parágrafos que só descrevem o trabalho (proposta, questão de pesquisa, objetivos, validação com a base sintética e organização do texto) continuam sem citação, como no texto de 28/09. Se o orientador quiser fonte também neles, perguntem quais.


## O que levar para o capítulo

1. **Molina (1.4 §6):** mover para o meio da frase sobre anomalias (regra nova do orientador).
2. **Rodrigues (1.1 §3):** reescrever a diferença entre o trabalho dele e o de vocês.
3. **Kumar (abertura §1):** tirar "estabilidade econômica" e "clientes fiéis", ou deixá-los como frase do grupo.
4. **Whang (1.1 §2):** "prática comum" em vez de "etapa necessária".
5. **Brandt e Vidotti (abertura §5):** "mapear, organizar, documentar e gerir os dados"; conferir o ano.
6. **Guerra (1.4 §1):** fonte para "pesquisa aplicada", ou confirmar com o orientador.
7. **Bello (1.4 §2):** conferir pelo PDF de vocês ou trocar por Mohammed.
8. **Databricks:** ano de 2026 na página.
9. **Patil:** link da lista com erro ("olumeArticles"); considerar deixar só Ali.

## Fontes consultadas (08/11/2026)

- Kumar: https://pmc.ncbi.nlm.nih.gov/articles/PMC12297633/ ; https://api.openalex.org/works/doi:10.1038/s41598-025-12848-0 (a Nature não abriu).
- Lopes e Carvalho: https://www.scielo.br/j/bbr/a/BYQrQVhdPKy7ywBNdMCFWRN/?lang=pt
- CNseg: https://cnseg.org.br/publicacoes/22-ciclo-do-sqf-1-semestre-de-2024 e PDF https://production-cms-upload.s3.sa-east-1.amazonaws.com/05_SQF_22_2024_1_Semestre_V5_FINAL_1_892423d1d2.pdf
- Ali: https://www.mdpi.com/2076-3417/12/19/9637
- Nicola, Lauretto e Valdivia Delgado: https://sol.sbc.org.br/index.php/eniac/article/view/12118
- Rodrigues: https://api.openalex.org/works/doi:10.11606/003291891 (doi.org e bdta.abcd.usp.br bloqueados).
- Brandt e Vidotti: https://api.openalex.org/works/doi:10.22478/ufpb.1809-4783.2020v30n4.57349 (portal da UFPB em manutenção; Crossref e Brapci não abriram).
- Databricks: https://docs.databricks.com/aws/en/lakehouse/medallion
- Patil: https://www.ijasret.com/VolumeArticles/FullTextPDF/1495_2.Faud_Detection_and_Analysis_for_Insurance_Claim_using.pdf
- Whang: https://arxiv.org/abs/2112.06409 e https://arxiv.org/pdf/2112.06409
- Farias: https://acervo.ufrn.br/Record/ri-123456789-44577 (repositorio.ufrn.br não abriu).
- Guerra: https://recima21.com.br/recima21/article/download/5584/3830/33469
- Bello: https://www.researchgate.net/publication/381548526 (não abriu); busca no OpenAlex pelo título, sem resultado.
- Bansal: https://www.kaggle.com/datasets/shivamb/vehicle-claim-fraud-detection e a API do Kaggle.
- Dasgupta: https://norma.ncirl.ie/4224/ e https://norma.ncirl.ie/4224/1/sanandadasgupta.pdf
- Özaltin e Karadağ Erdemir: https://api.openalex.org/works/doi:10.1038/s41598-025-25700-2 (Nature e PubMed Central bloquearam).
- Cristovão: https://api.openalex.org/works/doi:10.11606/d.55.2023.tde-23082023-102023 (teses.usp.br bloqueado).
- Molina: https://repositorio.unb.br/handle/10482/45317 e o PDF.
- Mohammed: https://arxiv.org/abs/2207.14529 e https://arxiv.org/pdf/2207.14529v6
