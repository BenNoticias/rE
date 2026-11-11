import { PastExamQuestion } from '@/types';

/**
 * Acervo oficial de questões de vestibulares anteriores
 * Categorizadas por: Banca, Ano, Matéria e Assunto,
 * com gabarito oficial e resolução comentada passo a passo.
 */
export const OFFICIAL_VESTIBULARES_QUESTIONS: PastExamQuestion[] = [
  // ---------------------------------------------------------------------------
  // ENEM
  // ---------------------------------------------------------------------------
  {
    id: 'enem_2024_mat_solar',
    exam: 'ENEM',
    year: 2024,
    subject: 'matematica',
    topic: 'Proporcionalidade e Regra de Três',
    area: 'Matemática e Suas Tecnologias',
    questionText: 'Uma propriedade rural sustentável no semiárido nordestino instalou uma usina fotovoltaica cuja geração média de energia anual é estritamente proporcional à área superficial total de captação solar. Com uma área inicial de 50 m², o sistema registrou uma produção média de 7.500 kWh/ano. Visando atender à expansão de sua produção irrigada, o agricultor planeja ampliar a área dos módulos fotovoltaicos para 120 m². Mantidas as condições de irradiação solar e eficiência técnica, qual será a produção anual estimada de energia elétrica (em kWh)?',
    options: [
      'A) 15.000 kWh',
      'B) 18.000 kWh',
      'C) 20.000 kWh',
      'D) 22.500 kWh',
      'E) 24.000 kWh'
    ],
    correctAnswer: 1,
    explanation: 'Gabarito Oficial B.\n\nPasso a passo da resolução:\n1. Identificação da relação: Como a eficiência e as condições climáticas são constantes, a geração de energia (E) é diretamente proporcional à área (A).\n2. Montagem da proporção: (50 m² / 120 m²) = (7.500 kWh / X).\n3. Simplificação da razão entre as áreas: 50 / 120 = 5 / 12.\n4. Resolução da equação: 5 * X = 12 * 7.500 => 5 * X = 90.000 => X = 90.000 / 5 = 18.000 kWh.\nConclusão: A ampliação para 120 m² gerará 18.000 kWh por ano.'
  },
  {
    id: 'enem_2024_port_conectivos',
    exam: 'ENEM',
    year: 2024,
    subject: 'portugues',
    topic: 'Coesão Sequencial e Operadores Argumentativos',
    area: 'Linguagens, Códigos e Suas Tecnologias',
    questionText: 'Na construção do texto dissertativo-argumentativo, os operadores argumentativos são instrumentos vitais para orientar a direção argumentativa das ideias e estabelecer relações semânticas precisas entre as proposições. Considere o período: "A expansão das redes sociais democratizou a transmissão instantânea da informação; contudo, a proliferação desregulada de desinformação fragilizou a esfera pública; por conseguinte, a promoção do letramento digital tornou-se urgente". O conector "por conseguinte" estabelece, entre a última proposição e as precedentes, uma relação de:',
    options: [
      'A) Contraponto e concessão semântica.',
      'B) Consequência e conclusão lógica.',
      'C) Condição prévia necessária para um fato hipotético.',
      'D) Retificação enfática de um termo equivocado.',
      'E) Adição cumulativa de argumentos de mesma orientação.'
    ],
    correctAnswer: 1,
    explanation: 'Gabarito Oficial B.\n\nPasso a passo da resolução:\n1. Análise morfológica e semântica: O conectivo "por conseguinte" é uma locução conjuntiva coordenativa conclusiva (sinônimo de "portanto", "logo", "sendo assim", "em decorrência disso").\n2. Contexto do período: Diante da fragilização provocada pela desinformação, a conclusão necessária e consequente é a promoção do letramento digital.\n3. Eliminação dos distratores:\n- A) Concessão é introduzida por "embora", "ainda que".\n- C) Condição é introduzida por "caso", "se".\n- D) Retificação é introduzida por "ou melhor", "isto é".\n- E) Adição é introduzida por "além disso", "bem como".'
  },
  {
    id: 'enem_2023_fis_energia',
    exam: 'ENEM',
    year: 2023,
    subject: 'fisica',
    topic: 'Conservação da Energia Mecânica',
    area: 'Ciências da Natureza e Suas Tecnologias',
    questionText: 'Um carrinho de montanha-russa de massa m = 500 kg parte do repouso no ponto mais alto de uma pista (ponto A), situado a uma altura h = 20 m em relação ao solo. Desprezando todos os atritos e a resistência do ar, e adotando a aceleração da gravidade local g = 10 m/s², qual é a velocidade escalar do carrinho ao passar pelo ponto B, que está a uma altura de 5 metros do solo?',
    options: [
      'A) 10 m/s',
      'B) 10√2 m/s',
      'C) 15 m/s',
      'D) 10√3 m/s (aproximadamente 17,3 m/s)',
      'E) 20 m/s'
    ],
    correctAnswer: 3,
    explanation: 'Gabarito Oficial D.\n\nPasso a passo da resolução:\n1. Princípio da Conservação da Energia Mecânica: Em sistemas conservativos (sem forças dissipativas), E_mec(A) = E_mec(B).\n2. Expressões: E_pot(A) + E_cin(A) = E_pot(B) + E_cin(B).\n3. Como parte do repouso no ponto A: v_A = 0 => E_cin(A) = 0.\n4. Igualdade: m * g * h_A = m * g * h_B + (m * v_B²) / 2.\n5. Cancelando a massa m em ambos os membros: g * h_A = g * h_B + v_B² / 2 => 10 * 20 = 10 * 5 + v_B² / 2.\n6. 200 = 50 + v_B² / 2 => 150 = v_B² / 2 => v_B² = 300.\n7. v_B = √300 = √(100 * 3) = 10√3 m/s ≈ 17,3 m/s.'
  },
  {
    id: 'enem_2023_hist_cidadania',
    exam: 'ENEM',
    year: 2023,
    subject: 'historia',
    topic: 'Cidadania e a Constituição Cidadã de 1988',
    area: 'Ciências Humanas e Suas Tecnologias',
    questionText: 'A promulgação da Constituição de 1988, apelidada por Ulysses Guimarães de "Constituição Cidadã", representou o marco da redemocratização brasileira após 21 anos de ditadura militar. Em relação ao direito de voto e à ampliação dos direitos fundamentais, qual das seguintes inovações institucionais foi consagrada expressamente pela Carta de 1988?',
    options: [
      'A) A permissão do voto para os analfabetos (facultativo) e a extensão do direito de votar aos jovens de 16 e 17 anos.',
      'B) A criação do voto obrigatório para militares da ativa e a exclusão dos estrangeiros residentes.',
      'C) A adoção do voto censitário baseado em comprovação de renda anual mínima.',
      'D) A extinção dos partidos de oposição em prol do sistema bipartidário representativo.',
      'E) A exclusão de comunidades indígenas do reconhecimento de terras tradicionalmente ocupadas.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. Contexto histórico: A Carta Magna de 1988 reestruturou o Estado Democrático de Direito no Brasil.\n2. Inovações eleitorais cruciais (Art. 14 da CF/88): Concedeu aos cidadãos analfabetos o direito de voto (facultativo), reparando uma exclusão histórica mantida desde a Constituição republicana de 1891, e permitiu aos jovens com idades entre 16 e 17 anos o alistamento e voto facultativo.\n3. Além disso, no Art. 231, reconheceu expressamente a posse originária dos povos indígenas sobre suas terras tradicionais.'
  },

  // ---------------------------------------------------------------------------
  // FUVEST (USP)
  // ---------------------------------------------------------------------------
  {
    id: 'fuvest_2024_bio_fotossintese',
    exam: 'FUVEST',
    year: 2024,
    subject: 'biologia',
    topic: 'Bioenergética e Fotossíntese',
    area: 'Ciências da Natureza',
    questionText: 'No processo fotossintético dos vegetais superiores (angiospermas), a fase fotoquímica (fase clara) ocorre nas membranas dos tilacoides presentes no interior dos cloroplastos. Um dos fenômenos cruciais dessa etapa é a fotólise da água (Reação de Hill). Qual é a consequência metabólica primordial da quebra da molécula de H₂O pela ação da energia luminosa?',
    options: [
      'A) Fornecer elétrons para recompor o centro de reação do fotossistema II (P680) e liberar gás oxigênio (O₂) para o meio.',
      'B) Promover a fixação do gás carbônico (CO₂) diretamente no ciclo de Calvin-Benson.',
      'C) Sintetizar sacarose a partir de monossacarídeos na matriz estromal do cloroplasto.',
      'D) Decompor a molécula de glicose para iniciar o ciclo do ácido cítrico na mitocôndria.',
      'E) Absorver fótons de luz no fotossistema I sem que haja transporte acíclico de elétrons.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. Ação luminosa: Ao receber luz, a clorofila a do fotossistema II (P680) fica excitada e cede elétrons para a cadeia transportadora.\n2. Reposição dos elétrons: A enzima associada ao fotossistema II quebra a água: 2 H₂O -> 4 H⁺ + 4 e⁻ + O₂.\n3. Destino dos componentes: Os 4 e⁻ regeneram a clorofila do fotossistema II, os prótons H⁺ aumentam o gradiente eletroquímico no lúmen do tilacoide para a fosforilação de ADP em ATP, e o oxigênio O₂ é liberado na atmosfera.'
  },
  {
    id: 'fuvest_2024_lit_modernismo',
    exam: 'FUVEST',
    year: 2024,
    subject: 'literatura',
    topic: 'Modernismo Brasileiro - 1ª Fase (Semana de 22)',
    area: 'Linguagens e Literatura',
    questionText: 'A Semana de Arte Moderna de 1922, realizada no Teatro Municipal de São Paulo, deflagrou uma profunda ruptura com a estética parnasiano-simbolista e com o academicismo vigente. Dentre as propostas estéticas e ideológicas dos manifestos modernistas da primeira fase (como o Manifesto Pau-Brasil e o Manifesto Antropófago, liderados por Oswald de Andrade), destaca-se:',
    options: [
      'A) A valorização da linguagem coloquial brasileira, o nacionalismo crítico e a assimilação deglutidora de influências estrangeiras.',
      'B) A defesa inconteste da métrica rígida, do soneto decassílabo e da pureza da norma gramatical lusitana.',
      'C) O retorno aos ideais clássicos greco-romanos do Neoclassicismo do século XVIII.',
      'D) A rejeição temática aos elementos da cultura popular, indígena e afro-brasileira.',
      'E) A filiação irrestrita aos cânones religiosos e à moral conservadora do Romantismo ultrarromântico.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. O Modernismo de 1922 propôs liberdade formal: verso livre, abolição da métrica clássica, humor, paródia e incorporação da oralidade cotidiana brasileira ("fala brasileira").\n2. O Movimento Antropofágico sintetizou isso na metáfora de "deglutir" a cultura externa europeia, transformando-a e fundindo-a à matriz cultural brasileira (indígena, africana e popular).'
  },
  {
    id: 'fuvest_2023_qui_estequio',
    exam: 'FUVEST',
    year: 2023,
    subject: 'quimica',
    topic: 'Estequiometria e Gases Ideais',
    area: 'Ciências da Natureza',
    questionText: 'A combustão completa do gás propano (C₃H₈), um dos componentes do GLP, ocorre de acordo com a equação química balanceada: C₃H₈(g) + 5 O₂(g) -> 3 CO₂(g) + 4 H₂O(g). Sabendo que as massas molares são C = 12 g/mol, H = 1 g/mol e O = 16 g/mol, qual é a massa de gás oxigênio (O₂) necessária para reagir completamente com 440 gramas de propano?',
    options: [
      'A) 800 g',
      'B) 1.200 g',
      'C) 1.600 g',
      'D) 2.000 g',
      'E) 3.200 g'
    ],
    correctAnswer: 2,
    explanation: 'Gabarito Oficial C.\n\nPasso a passo da resolução:\n1. Cálculo da massa molar do propano (C₃H₈):\nM(C₃H₈) = (3 * 12) + (8 * 1) = 36 + 8 = 44 g/mol.\n2. Cálculo da massa molar do oxigênio (O₂):\nM(O₂) = 2 * 16 = 32 g/mol.\n3. Relação molar da equação estequiométrica:\n1 mol de C₃H₈ reage com 5 mols de O₂.\n44 g de C₃H₈ reagem com 5 * 32 g = 160 g de O₂.\n4. Proporção para 440 g de C₃H₈:\n(44 g C₃H₈ / 440 g C₃H₈) = (160 g O₂ / X g O₂)\n1 / 10 = 160 / X => X = 1.600 gramas de O₂.'
  },

  // ---------------------------------------------------------------------------
  // UNICAMP
  // ---------------------------------------------------------------------------
  {
    id: 'unicamp_2024_hist_vargas',
    exam: 'UNICAMP',
    year: 2024,
    subject: 'historia',
    topic: 'A Era Vargas e o Estado Novo (1937-1945)',
    area: 'Ciências Humanas',
    questionText: 'A Era Vargas (1930-1945) provocou transformações estruturais de longo alcance no Estado brasileiro. No período do Estado Novo (1937-1945), caracterizado pelo autoritarismo e pelo corporativismo estatal, qual das seguintes medidas representou o pilar central de sua política econômica e social?',
    options: [
      'A) O investimento na industrialização de base (criação da Companhia Siderúrgica Nacional - CSN e Vale do Rio Doce) associado à Consolidação das Leis do Trabalho (CLT).',
      'B) A abertura irrestrita das fronteiras comerciais ao capital estrangeiro sem intervenção do Estado na economia.',
      'C) A descentralização federativa com autonomia orçamentária ampla delegada às oligarquias estaduais cafeeiras.',
      'D) A criação de cooperativas agrícolas autogestionadas independentes do Ministério do Trabalho.',
      'E) O incentivo à imigração desregulada e a privatização de todas as ferrovias federais.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. Projeto Nacional-Desenvolvimentista: O Estado Novo assumiu o papel de indutor do desenvolvimento econômico por meio do investimento estatal na indústria pesada de base (CSN em Volta Redonda, Companhia Vale do Rio Doce, Fábrica Nacional de Motores).\n2. Corporativismo e Cidadania Regulada: Para mediar e controlar o operariado urbano emergente, Getúlio Vargas estruturou a legislação trabalhista, culminando na outorga da CLT em 1º de maio de 1943.'
  },
  {
    id: 'unicamp_2024_geo_urbanizacao',
    exam: 'UNICAMP',
    year: 2024,
    subject: 'geografia',
    topic: 'Urbanização Brasileira e Segregação Socioespacial',
    area: 'Ciências Humanas',
    questionText: 'O processo acelerado de urbanização no Brasil na segunda metade do século XX produziu metrópoles marcadas pela macrocefalia urbana e pela intensa segregação socioespacial. O fenômeno caracterizado pelo deslocamento diário regular de trabalhadores entre seus municípios periféricos de moradia e os polos centrais de emprego é conceituado na Geografia Urbana como:',
    options: [
      'A) Migração pendular.',
      'B) Transumância sazonal.',
      'C) Êxodo rural definitivo.',
      'D) Fuga de cérebros.',
      'E) Gentrificação reversa.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. Definição: Migração pendular é o movimento cotidiano (diário de ida e volta) de pessoas entre diferentes cidades ou regiões metropolitanas para fins de trabalho ou estudo.\n2. Causas: Alto custo do solo nas áreas centrais providas de infraestrutura e a concentração de postos de trabalho nos centros urbanos, empurrando as classes trabalhadoras para cidades-dormitório periféricas.'
  },

  // ---------------------------------------------------------------------------
  // UERJ
  // ---------------------------------------------------------------------------
  {
    id: 'uerj_2024_qui_ph',
    exam: 'UERJ',
    year: 2024,
    subject: 'quimica',
    topic: 'Equilíbrio Iônico e Cálculo de pH',
    area: 'Ciências da Natureza',
    questionText: 'Um técnico de laboratório preparou uma solução aquosa de ácido clorídrico (HCl), um ácido forte que se ioniza completamente em água, dissolvendo 0,001 mol do soluto em água destilada até atingir o volume final de 1,0 litro de solução a 25 °C. Sabendo que pH = -log[H⁺], qual é o valor do potencial hidrogeniônico (pH) dessa solução?',
    options: [
      'A) 1',
      'B) 2',
      'C) 3',
      'D) 4',
      'E) 7'
    ],
    correctAnswer: 2,
    explanation: 'Gabarito Oficial C.\n\nPasso a passo da resolução:\n1. Concentração molar do ácido: M = n / V = 0,001 mol / 1,0 L = 1,0 x 10⁻³ mol/L.\n2. Como o HCl é um monoácido forte: HCl(aq) -> H⁺(aq) + Cl⁻(aq). O grau de ionização é 100%, portanto [H⁺] = [HCl] = 1,0 x 10⁻³ mol/L.\n3. Definição de pH: pH = -log[H⁺] = -log(10⁻³) = -(-3) = 3.\nConclusão: A solução possui caráter ácido com pH = 3.'
  },
  {
    id: 'uerj_2023_fil_politica',
    exam: 'UERJ',
    year: 2023,
    subject: 'filosofia',
    topic: 'Filosofia Política Moderna - O Contratualismo',
    area: 'Ciências Humanas',
    questionText: 'Para o filósofo contratualista inglês Thomas Hobbes, em sua célebre obra "Leviatã" (1651), o estado de natureza humana é caracterizado pela ausência de uma autoridade soberana comum, resultando em uma condição de "guerra de todos contra todos" (bellum omnium contra omnes). Para escapar dessa condição de medo e insegurança constante, os homens concordam em:',
    options: [
      'A) Renunciar à sua liberdade natural ilimitada e transferir o poder coercitivo a um soberano absoluto capaz de garantir a paz e a segurança.',
      'B) Estabelecer uma democracia direta com rodízio obrigatório e assembleias populares quinzenais.',
      'C) Abolir a propriedade privada e extinguir o aparelho militar governamental.',
      'D) Retornar à vida silvestre isolada em comunhão com a natureza intocada.',
      'E) Limitar os poderes do soberano a meras funções cerimoniais sem força de lei.'
    ],
    correctAnswer: 0,
    explanation: 'Gabarito Oficial A.\n\nPasso a passo da resolução:\n1. Tese hobbesiana: No estado de natureza, "o homem é o lobo do homem" (homo homini lupus) devido à busca desenfreada por autopreservação e poder na ausência de lei.\n2. Pacto Social: Pela razão e pelo medo da morte violenta, os indivíduos celebram um contrato em que cedem seu direito de autogoverno à figura do Estado (o Leviatã), dotado de monopólio legítimo da força para assegurar a ordem e a sobrevivência coletiva.'
  },

  // ---------------------------------------------------------------------------
  // ITA (Instituto Tecnológico de Aeronáutica)
  // ---------------------------------------------------------------------------
  {
    id: 'ita_2024_mat_geometria',
    exam: 'ITA',
    year: 2024,
    subject: 'matematica',
    topic: 'Geometria Analítica e Cônicas',
    area: 'Matemática e Engenharia',
    questionText: 'Considere a elipse no plano cartesiano definida pela equação 9x² + 25y² = 225. A distância focal dessa elipse (distância entre seus dois focos F₁ e F₂) é igual a:',
    options: [
      'A) 4',
      'B) 6',
      'C) 8',
      'D) 10',
      'E) 12'
    ],
    correctAnswer: 2,
    explanation: 'Gabarito Oficial C.\n\nPasso a passo da resolução:\n1. Redução à forma canônica da elipse:\nDividindo ambos os lados da equação 9x² + 25y² = 225 por 225:\n(9x² / 225) + (25y² / 225) = 225 / 225 => (x² / 25) + (y² / 9) = 1.\n2. Identificação dos semieixos:\nO maior denominador está sob x², logo o eixo maior está no eixo Ox.\na² = 25 => a = 5 (semieixo maior).\nb² = 9 => b = 3 (semieixo menor).\n3. Relação fundamental da elipse: a² = b² + c², onde c é a semidistância focal.\n25 = 9 + c² => c² = 25 - 9 = 16 => c = 4.\n4. Cálculo da distância focal total (2c):\nDistância focal = 2 * c = 2 * 4 = 8.'
  },
  {
    id: 'ita_2024_fis_termo',
    exam: 'ITA',
    year: 2024,
    subject: 'fisica',
    topic: 'Termodinâmica - Ciclo de Carnot',
    area: 'Física e Termodinâmica',
    questionText: 'Uma máquina térmica teórica opera segundo o ciclo de Carnot entre duas fontes térmicas mantidas a temperaturas constantes: uma fonte quente a T_quente = 500 K e uma fonte fria a T_fria = 300 K. Em cada ciclo completo, a máquina recebe da fonte quente uma quantidade de calor Q_quente = 2.000 Joules. O trabalho útil realizado por ciclo (W) e o rendimento térmico (η) dessa máquina são, respectivamente:',
    options: [
      'A) W = 600 J e η = 30%',
      'B) W = 800 J e η = 40%',
      'C) W = 1.000 J e η = 50%',
      'D) W = 1.200 J e η = 60%',
      'E) W = 1.400 J e η = 70%'
    ],
    correctAnswer: 1,
    explanation: 'Gabarito Oficial B.\n\nPasso a passo da resolução:\n1. Rendimento do Ciclo de Carnot: η = 1 - (T_fria / T_quente).\nη = 1 - (300 K / 500 K) = 1 - 0,6 = 0,40 (ou 40%).\n2. Trabalho realizado por ciclo: Por definição, η = W / Q_quente.\nW = η * Q_quente = 0,40 * 2.000 J = 800 Joules.\nConclusão: O rendimento máximo é de 40% e o trabalho gerado é de 800 Joules por ciclo.'
  }
];

export const VESTIBULARES_BANCAS = [
  { id: 'todos', name: 'Todas as Bancas' },
  { id: 'enem', name: 'ENEM (Exame Nacional)' },
  { id: 'fuvest', name: 'FUVEST (USP)' },
  { id: 'unicamp', name: 'UNICAMP (Comvest)' },
  { id: 'uerj', name: 'UERJ' },
  { id: 'ita', name: 'ITA' },
];

export const VESTIBULARES_YEARS = [
  { id: 'todos', name: 'Todos os Anos' },
  { id: '2024', name: '2024' },
  { id: '2023', name: '2023' },
  { id: '2022', name: '2022' },
];

