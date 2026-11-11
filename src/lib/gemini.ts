import { GoogleGenerativeAI } from '@google/generative-ai';
import { GradeLevel, GRADE_OPTIONS } from '@/types';

/**
 * Obtém a chave da API do Gemini priorizando:
 * 1. Chave personalizada enviada pelo usuário na requisição
 * 2. process.env.GEMINI_API_KEY (Ambiente de Produção / Vercel)
 * 3. process.env.NEXT_PUBLIC_GEMINI_API_KEY (Legado / Fallback)
 */
export function getGeminiApiKey(customApiKey?: string): string {
  if (customApiKey && customApiKey.trim().length > 5) {
    return customApiKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  return envKey.trim();
}

/**
 * Inicializa o cliente do Google Generative AI
 */
export function getGeminiClient(customApiKey?: string): GoogleGenerativeAI {
  const apiKey = getGeminiApiKey(customApiKey);
  if (!apiKey) {
    throw new Error('API Key do Gemini não encontrada. Configure a variável GEMINI_API_KEY no arquivo .env.local ou nas variáveis da Vercel.');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Retorna o modelo padrão recomendado para a API oficial do Google Gemini
 */
export function getRecommendedModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';
}

/**
 * Executa uma chamada à API do Gemini com fallback entre modelos oficiais
 * e garante retorno estruturado em JSON.
 */
export async function generateGeminiJson<T>(
  prompt: string,
  customApiKey?: string,
  preferredModel?: string
): Promise<T | null> {
  const apiKey = getGeminiApiKey(customApiKey);
  if (!apiKey) {
    console.warn('[Gemini API] Nenhuma chave de API fornecida em process.env.GEMINI_API_KEY.');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const primaryModel = preferredModel || getRecommendedModelName();
  
  // Modelos suportados pela API oficial do Google com fallback
  const modelsToTry = [
    primaryModel,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '';

      const parsed = safeParseJson<T>(text);
      if (parsed) {
        return parsed;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Falha no modelo "${modelName}":`, err?.message || err);
      // Erro irrecuperável de credenciais: interrompe tentativas
      if (
        err?.message?.includes('API_KEY_INVALID') || 
        err?.message?.includes('API key not valid') ||
        err?.status === 400 && err?.message?.includes('API key')
      ) {
        break;
      }
    }
  }

  if (lastError) {
    console.error('[Gemini API] Todas as tentativas de geração falharam:', lastError?.message || lastError);
  }

  return null;
}

export function getGradeDescription(grade: GradeLevel): string {
  const info = GRADE_OPTIONS.find(g => g.id === grade);
  if (!info) return 'Ensino Médio';
  if (info.category === 'Fundamental') {
    return `${info.label} (${info.description}). Use linguagem didática, acessível, bem explicada, com conceitos fundamentais e exemplos práticos da rotina escolar de alunos dessa faixa etária.`;
  }
  return `${info.label} (${info.description}). Use rigor conceitual e terminologia científica adequada ao Ensino Médio, com foco em aprovação em exames nacionais (ENEM), vestibulares e alta performance.`;
}

/**
 * Faz o parse seguro do retorno em JSON gerado pelo Gemini, tratando blocos de código
 * markdown, caracteres residuais e delimitadores.
 */
export function safeParseJson<T>(text: string): T | null {
  if (!text || typeof text !== 'string') return null;

  // 1. Limpeza inicial de blocos markdown
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Tentativa direta
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continua para extração
  }

  // 2. Extração delimitada pelo primeiro e último caractere de JSON { ... } ou [ ... ]
  try {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      const extracted = cleaned.substring(start, end + 1);
      return JSON.parse(extracted) as T;
    }
  } catch (extractErr) {
    // Ignora e tenta regex
  }

  // 3. Fallback com expressão regular
  try {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
  } catch (regexErr) {
    console.error('[safeParseJson] Erro ao analisar JSON gerado pelo Gemini:', regexErr);
  }

  return null;
}
