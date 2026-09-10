import { GoogleGenerativeAI } from '@google/generative-ai';
import { GradeLevel, GRADE_OPTIONS } from '@/types';

export function getGeminiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim().length > 5)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  return new GoogleGenerativeAI(apiKey);
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
 * Safely parses JSON output from Gemini, stripping markdown code fences if present.
 */
export function safeParseJson<T>(text: string): T | null {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // Attempt regex extraction if simple string replacement leaves residual text
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch (err) {
        console.error("Failed to parse regex extracted JSON:", err);
      }
    }
    console.error("JSON parse error from Gemini output:", e);
    return null;
  }
}
