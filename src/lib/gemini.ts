import { GoogleGenAI } from '@google/genai';
import { GradeLevel, GRADE_OPTIONS } from '@/types';

/**
 * List of available Gemini models in order of preference.
 * Auto-fallback handles 404 (deprecated models) and 503 (temporary high demand).
 */
const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
];

/**
 * Returns an instance of GoogleGenAI initialized with user custom key or environment variable.
 */
export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey && customApiKey.trim().length > 5)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  return new GoogleGenAI({ apiKey });
}

export function getGradeDescription(grade: GradeLevel): string {
  const info = GRADE_OPTIONS.find(g => g.id === grade);
  if (!info) return 'Ensino Médio';
  if (info.category === 'Fundamental') {
    return `${info.label} (${info.description}). Use linguagem didática, acessível, bem explicada, com conceitos fundamentais e exemplos práticos da rotina escolar de alunos dessa faixa etária.`;
  }
  return `${info.label} (${info.description}). Use rigor conceitual e terminologia científica adequada ao Ensino Médio, com foco em aprovação em exames nacionais (ENEM), vestibulares e alta performance.`;
}

export interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  userApiKey?: string;
  temperature?: number;
  responseMimeType?: string;
  timeoutMs?: number;
}

/**
 * Calls Gemini API via strictly @google/genai SDK with multi-model fallback (handling 503/404),
 * custom timeouts, REST HTTP fallback, and robust error handling.
 */
export async function generateGeminiContent(options: GenerateOptions): Promise<string> {
  const {
    prompt,
    systemInstruction,
    userApiKey,
    temperature = 0.7,
    responseMimeType,
    timeoutMs = 60000,
  } = options;

  const apiKey = (userApiKey && userApiKey.trim().length > 5)
    ? userApiKey.trim()
    : process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error('Chave de API do Gemini não configurada.');
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  // Attempt generation using candidate models
  for (const modelName of GEMINI_MODELS) {
    try {
      const apiCall = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature,
          systemInstruction,
          responseMimeType,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout na chamada do modelo ${modelName} (${timeoutMs}ms)`)), timeoutMs);
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const responseText = response.text;

      if (responseText && responseText.trim().length > 0) {
        return responseText;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini SDK model ${modelName} failed]:`, err?.message || err);
      // Continue to next model if 404 (not found/deprecated) or 503 (high demand)
    }
  }

  // Resilient direct REST API fallback if SDK model loop fails
  for (const modelName of ['gemini-3.8-flash', 'gemini-3.5-flash']) {
    try {
      console.log(`Attempting direct REST API fallback with ${modelName}...`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              responseMimeType,
            },
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          }),
        }
      );

      clearTimeout(timer);

      if (restRes.ok) {
        const data = await restRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch (restErr: any) {
      console.error(`Gemini REST API fallback with ${modelName} failed:`, restErr?.message || restErr);
    }
  }

  throw lastError || new Error('Falha ao conectar com o serviço do Gemini.');
}

function cleanJsonCandidates(str: string): string {
  return str
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
    // Corrige letras ou valores literais desprotegidos (ex: "correctAnswer": C, -> "correctAnswer": "C",)
    .replace(/:\s*([A-Za-z])\s*([,\r\n}])/g, ': "$1"$2')
    // Remove caracteres invisíveis de controle
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    // Corrige barras invertidas desnecessárias como de LaTeX (\Delta, \frac, \text)
    .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")
    // Remove vírgulas sobressalentes antes de fechamento de chaves ou colchetes
    .replace(/,\s*([\]}])/g, '$1');
}

/**
 * Safely parses JSON output from Gemini, handling markdown fences, unescaped LaTeX backslashes,
 * unquoted answer letters, trailing commas, and regex fallback extraction.
 */
export function safeParseJson<T>(text: string): T | null {
  if (!text || typeof text !== 'string') return null;

  // Step 1: Clean markdown code blocks
  let cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Step 2: Direct JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (e1) {
    // Step 3: Parse com sanitização e correção de caracteres
    try {
      const sanitized = cleanJsonCandidates(cleaned);
      return JSON.parse(sanitized) as T;
    } catch (e2) {
      // Step 4: Regex extraction para encontrar objeto ou array JSON
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const sanitizedMatch = cleanJsonCandidates(jsonMatch[0]);
          return JSON.parse(sanitizedMatch) as T;
        } catch (err) {
          console.error("Failed to parse regex-extracted JSON:", err);
        }
      }
      console.error("JSON parse error from Gemini output:", e1);
      return null;
    }
  }
}
