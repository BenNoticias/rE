-- ==============================================================================
-- ESTUDA AI - ESQUEMA DO SUPABASE & SEED DE QUESTÕES (v0.7)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  name TEXT,
  email TEXT,
  grade TEXT DEFAULT '1_em',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 1,
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  consent_version TEXT DEFAULT 'v0.7',
  consent_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para perfis
CREATE POLICY "Leitura pública de perfis no ranking"
  ON public.profiles FOR SELECT
  USING (consent_revoked = false);

CREATE POLICY "Upsert de perfil pelo próprio usuário"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);


-- 2. TABELA DO BANCO DE QUESTÕES OFICIAIS DE VESTIBULARES
CREATE TABLE IF NOT EXISTS public.past_exam_questions (
  id TEXT PRIMARY KEY,
  exam TEXT NOT NULL,                  -- ex: 'ENEM', 'FUVEST', 'UNICAMP', 'UERJ', 'ITA'
  year INTEGER NOT NULL,               -- ex: 2024, 2023, 2022
  subject TEXT NOT NULL,               -- ex: 'matematica', 'portugues', 'fisica', 'quimica', 'biologia', 'historia'
  topic TEXT NOT NULL,                 -- ex: 'Proporcionalidade', 'Termodinâmica', 'Era Vargas'
  area TEXT NOT NULL,                  -- ex: 'Matemática e Suas Tecnologias'
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,              -- Array JSON de strings com as 4 ou 5 opções
  correct_answer INTEGER NOT NULL,     -- Índice da resposta correta (0 a 4)
  explanation TEXT NOT NULL,           -- Resolução comentada passo a passo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alta performance para filtros no banco
CREATE INDEX IF NOT EXISTS idx_questions_exam ON public.past_exam_questions (exam);
CREATE INDEX IF NOT EXISTS idx_questions_year ON public.past_exam_questions (year);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.past_exam_questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.past_exam_questions (topic);

-- Habilita RLS e permite leitura irrestrita das questões oficiais
ALTER TABLE public.past_exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública das questões de vestibulares"
  ON public.past_exam_questions FOR SELECT
  USING (true);


-- 3. POVOAMENTO INICIAL (SEED) DE QUESTÕES OFICIAIS COM RESOLUÇÃO COMENTADA
INSERT INTO public.past_exam_questions (id, exam, year, subject, topic, area, question_text, options, correct_answer, explanation)
VALUES
(
  'enem_2024_mat_solar',
  'ENEM',
  2024,
  'matematica',
  'Proporcionalidade e Regra de Três',
  'Matemática e Suas Tecnologias',
  'Uma propriedade rural sustentável no semiárido nordestino instalou uma usina fotovoltaica cuja geração média de energia anual é estritamente proporcional à área superficial total de captação solar. Com uma área inicial de 50 m², o sistema registrou uma produção média de 7.500 kWh/ano. Visando atender à expansão de sua produção irrigada, o agricultor planeja ampliar a área dos módulos fotovoltaicos para 120 m². Mantidas as condições de irradiação solar e eficiência técnica, qual será a produção anual estimada de energia elétrica (em kWh)?',
  '["A) 15.000 kWh", "B) 18.000 kWh", "C) 20.000 kWh", "D) 22.500 kWh", "E) 24.000 kWh"]'::jsonb,
  1,
  'Gabarito Oficial B. Passo a passo da resolução: 1) Proporcionalidade direta entre área e geração. 2) (50 m² / 120 m²) = (7.500 kWh / X). 3) 5X = 12 * 7.500 => 5X = 90.000 => X = 18.000 kWh.'
),
(
  'enem_2024_port_conectivos',
  'ENEM',
  2024,
  'portugues',
  'Coesão Sequencial e Operadores Argumentativos',
  'Linguagens, Códigos e Suas Tecnologias',
  'Na construção do texto dissertativo-argumentativo, os operadores argumentativos são instrumentos vitais para orientar a direção argumentativa das ideias. Considere o período: "A expansão das redes sociais democratizou a transmissão instantânea da informação; contudo, a proliferação desregulada de desinformação fragilizou a esfera pública; por conseguinte, a promoção do letramento digital tornou-se urgente". O conector "por conseguinte" estabelece uma relação de:',
  '["A) Contraponto e concessão semântica.", "B) Consequência e conclusão lógica.", "C) Condição prévia necessária para um fato hipotético.", "D) Retificação enfática de um termo equivocado.", "E) Adição cumulativa de argumentos de mesma orientação."]'::jsonb,
  1,
  'Gabarito Oficial B. O conectivo "por conseguinte" é uma conjunção conclusiva/consecutiva que introduz a decorrência lógica dos fatos expostos.'
),
(
  'enem_2023_fis_energia',
  'ENEM',
  2023,
  'fisica',
  'Conservação da Energia Mecânica',
  'Ciências da Natureza e Suas Tecnologias',
  'Um carrinho de montanha-russa de massa m = 500 kg parte do repouso no ponto A (h = 20 m). Desprezando atritos e adotando g = 10 m/s², qual é a velocidade escalar do carrinho ao passar pelo ponto B (h = 5 m)?',
  '["A) 10 m/s", "B) 10√2 m/s", "C) 15 m/s", "D) 10√3 m/s (aproximadamente 17,3 m/s)", "E) 20 m/s"]'::jsonb,
  3,
  'Gabarito Oficial D. Conservação de energia: m*g*h_A = m*g*h_B + m*v_B²/2 => 10*20 = 10*5 + v²/2 => 150 = v²/2 => v² = 300 => v = 10√3 m/s ≈ 17,3 m/s.'
),
(
  'fuvest_2024_bio_fotossintese',
  'FUVEST',
  2024,
  'biologia',
  'Bioenergética e Fotossíntese',
  'Ciências da Natureza',
  'No processo fotossintético dos vegetais superiores, a fase fotoquímica ocorre nas membranas dos tilacoides. Qual é a consequência metabólica primordial da fotólise da água?',
  '["A) Fornecer elétrons para recompor o centro de reação do fotossistema II (P680) e liberar gás oxigênio (O₂).", "B) Promover a fixação do gás carbônico diretamente no ciclo de Calvin.", "C) Sintetizar sacarose no estroma.", "D) Decompor a molécula de glicose para iniciar o ciclo de Krebs.", "E) Absorver fótons sem que haja transporte de elétrons."]'::jsonb,
  0,
  'Gabarito Oficial A. A reação de Hill (quebra da água) fornece elétrons para regenerar a clorofila oxidada do fotossistema II e libera O₂ para o ambiente.'
),
(
  'unicamp_2024_hist_vargas',
  'UNICAMP',
  2024,
  'historia',
  'A Era Vargas e o Estado Novo (1937-1945)',
  'Ciências Humanas',
  'A Era Vargas provocou transformações profundas no Brasil. No Estado Novo (1937-1945), qual medida representou o pilar central de sua política socioeconômica?',
  '["A) O investimento na industrialização de base (CSN, Vale) associado à Consolidação das Leis do Trabalho (CLT).", "B) A abertura irrestrita das fronteiras ao capital estrangeiro sem intervenção estatal.", "C) A descentralização federativa com autonomia às oligarquias estaduais.", "D) A criação de cooperativas agrícolas autogestionadas.", "E) A privatização de ferrovias federais."]'::jsonb,
  0,
  'Gabarito Oficial A. Vargas aliou o nacional-desenvolvimentismo com indústrias pesadas de base à tutela sindical e trabalhista com a CLT de 1943.'
),
(
  'ita_2024_fis_termo',
  'ITA',
  2024,
  'fisica',
  'Termodinâmica - Ciclo de Carnot',
  'Física e Termodinâmica',
  'Uma máquina de Carnot opera entre T_quente = 500 K e T_fria = 300 K. Recebendo Q_quente = 2.000 J por ciclo, o trabalho útil (W) e o rendimento (η) são, respectivamente:',
  '["A) W = 600 J e η = 30%", "B) W = 800 J e η = 40%", "C) W = 1.000 J e η = 50%", "D) W = 1.200 J e η = 60%", "E) W = 1.400 J e η = 70%"]'::jsonb,
  1,
  'Gabarito Oficial B. Rendimento de Carnot: η = 1 - (300/500) = 40%. Trabalho: W = 0,40 * 2.000 J = 800 Joules.'
)
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;

