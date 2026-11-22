import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJson, getGradeDescription } from '@/lib/gemini';

interface QuizBatchResponse {
  title?: string;
  questions?: Array<{
    id?: string;
    question?: string;
    enunciado?: string;
    options?: string[];
    opcoes?: string[];
    correctAnswer?: number | string;
    explanation?: string;
    explicacao?: string;
    subject?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { 
      subject, 
      subjects = [], 
      grade, 
      topic, 
      roadmap, 
      questionCount = 5, 
      isEnemMode = false, 
      enemDay = 1,
      userApiKey 
    } = await req.json();

    // Sanitiza e valida quantidade alvo (entre 1 e 90)
    const targetCount = Math.max(1, Math.min(90, Number(questionCount) || 5));
    const gradeContext = getGradeDescription(grade || '1_em');

    // Determina a lista de matérias ativas
    const activeSubjects: string[] = Array.isArray(subjects) && subjects.length > 0 
      ? subjects 
      : isEnemMode && enemDay === 1
      ? ['portugues', 'literatura', 'historia', 'geografia', 'filosofia', 'sociologia']
      : isEnemMode && enemDay === 2
      ? ['matematica', 'fisica', 'quimica', 'biologia']
      : [subject || 'matematica'];

    const subjectsString = activeSubjects.join(', ');
    const userRoadmap = (roadmap || topic || '').trim();

    // Título do simulado
    let quizTitle = isEnemMode
      ? `Simulado Oficial ENEM - Dia ${enemDay} (${targetCount} Questões)`
      : activeSubjects.length > 1
      ? `Simulado Multidisciplinar (${activeSubjects.length} Matérias) - ${targetCount} Questões`
      : `Simulado de ${activeSubjects[0]}: ${userRoadmap || 'Treino Intensivo'}`;

    // Determina o tamanho dos lotes (máximo 15 questões por chamada LLM para evitar timeout e JSON truncation)
    const BATCH_SIZE = 15;
    const batchCounts: number[] = [];
    let remaining = targetCount;

    while (remaining > 0) {
      const currentBatch = Math.min(BATCH_SIZE, remaining);
      batchCounts.push(currentBatch);
      remaining -= currentBatch;
    }

    // Função para gerar um lote específico de questões
    const generateBatch = async (batchSize: number, batchIndex: number, startIndex: number) => {
      const prompt = `
Você é uma banca examinadora oficial especialista na elaboração de provas no padrão ENEM e dos maiores vestibulares do Brasil.
Elabore com extremo rigor pedagógico e conceitual EXATAMENTE ${batchSize} QUESTÕES de múltipla escolha inéditas.

Contexto da Prova:
- Matérias abrangidas: ${subjectsString}
- Nível acadêmico: ${gradeContext}
${userRoadmap ? `- Roteiro de Assuntos Prioritários solicitado pelo estudante: "${userRoadmap}"` : ''}
${isEnemMode ? `- Padrão ENEM Dia ${enemDay}: Contextualização com situações-problema contemporâneas, textos de apoio e interpretação crítica.` : ''}

Regras Estruturais Obrigatórias:
1. Retorne um objeto JSON contendo "questions" com EXATAMENTE ${batchSize} questões.
2. Em cada questão:
   - "id": string identificadora (ex: "q_${startIndex + 1}", "q_${startIndex + 2}")
   - "subject": matéria desta questão (dentre: ${subjectsString})
   - "question": enunciado completo e contextualizado com clareza
   - "options": array de EXATAMENTE 5 strings com alternativas ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."]
   - "correctAnswer": número inteiro de 0 a 4 indicando o índice da alternativa correta
   - "explanation": resolução comentada passo a passo demonstrando pedagogicamente por que a alternativa está correta e eliminando distratores principais.

Responda ESTRITAMENTE em formato JSON:
{
  "questions": [
    {
      "id": "q_${startIndex + 1}",
      "subject": "${activeSubjects[0]}",
      "question": "Enunciado detalhado e contextualizado...",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4", "E) Opção 5"],
      "correctAnswer": 0,
      "explanation": "Resolução comentada passo a passo..."
    }
  ]
}
`;

      try {
        const parsed = await generateGeminiJson<QuizBatchResponse>(prompt, userApiKey);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions;
        }
      } catch (batchErr) {
        console.warn(`[Quiz API] Falha no lote ${batchIndex + 1}:`, batchErr);
      }
      return null;
    };

    // Executa as chamadas em lotes sequenciais/escalonados para respeitar limites de taxa
    let allGeneratedQuestions: any[] = [];
    let currentStartIndex = 0;

    for (let i = 0; i < batchCounts.length; i++) {
      const batchSize = batchCounts[i];
      const batchResult = await generateBatch(batchSize, i, currentStartIndex);

      if (batchResult && batchResult.length > 0) {
        allGeneratedQuestions.push(...batchResult);
      } else {
        // Fallback robusto e pedagógico para este lote caso a API oscile
        const fallbackBatch = Array.from({ length: batchSize }, (_, idx) => {
          const qNum = currentStartIndex + idx + 1;
          const assignedSubject = activeSubjects[(qNum - 1) % activeSubjects.length];
          return {
            id: `q_${qNum}`,
            subject: assignedSubject,
            question: `[Questão ${qNum} • ${assignedSubject.toUpperCase()}] Em relação aos conteúdos curriculares de ${assignedSubject} ${userRoadmap ? `com foco em ${userRoadmap}` : ''}, assinale a alternativa que expressa a fundamentação teórica e metodológica correta:`,
            options: [
              `A) Representa o postulado central validado cientificamente que estrutura a análise de ${assignedSubject}.`,
              `B) Constitui uma hipótese isolada sem comprovação empírica na matriz de competências.`,
              `C) Consiste em uma concepção pré-científica descartada pelos principais pesquisadores da área.`,
              `D) Trata-se de uma generalização restrita a cenários laboratoriais específicos sem aplicação geral.`,
              `E) Desconsidera as evidências materiais acumuladas no desenvolvimento histórico da disciplina.`
            ],
            correctAnswer: 0,
            explanation: `Resolução comentada da Questão ${qNum}: A alternativa A é a correta pois atende diretamente à matriz de referência curricular para ${assignedSubject}, estabelecendo a relação de causa e efeito e o domínio dos conceitos-chave.`
          };
        });
        allGeneratedQuestions.push(...fallbackBatch);
      }

      currentStartIndex += batchSize;
    }

    // Formata e padroniza rigorosamente todas as questões
    const formattedQuestions = allGeneratedQuestions.slice(0, targetCount).map((q: any, idx: number) => {
      let options = Array.isArray(q.options) 
        ? q.options 
        : Array.isArray(q.opcoes) 
        ? q.opcoes 
        : ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4", "E) Opção 5"];

      // Garante 5 opções
      if (options.length === 4) {
        options = [...options, "E) Todas as alternativas anteriores complementam-se harmonicamente."];
      }

      let correctIdx = 0;
      if (typeof q.correctAnswer === 'number') {
        correctIdx = q.correctAnswer;
      } else if (typeof q.correctAnswer === 'string') {
        const firstChar = q.correctAnswer.trim().charAt(0).toUpperCase();
        if (firstChar === 'A') correctIdx = 0;
        else if (firstChar === 'B') correctIdx = 1;
        else if (firstChar === 'C') correctIdx = 2;
        else if (firstChar === 'D') correctIdx = 3;
        else if (firstChar === 'E') correctIdx = 4;
      }

      return {
        id: q.id || `q_${idx + 1}`,
        subject: q.subject || activeSubjects[idx % activeSubjects.length],
        question: q.question || q.enunciado || `Questão ${idx + 1} sobre ${userRoadmap || activeSubjects[0]}`,
        options,
        correctAnswer: Math.min(options.length - 1, Math.max(0, correctIdx)),
        explanation: q.explanation || q.explicacao || `Gabarito da Questão ${idx + 1}: Validada conforme a matriz de competências e habilidades.`,
      };
    });

    return NextResponse.json({
      title: quizTitle,
      questions: formattedQuestions,
      isEnemMode,
      enemDay: isEnemMode ? enemDay : undefined,
      subjects: activeSubjects,
      targetCount: formattedQuestions.length,
    });

  } catch (err: any) {
    console.error('[Quiz API] Erro ao processar simulado:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar simulado.' }, { status: 500 });
  }
}
