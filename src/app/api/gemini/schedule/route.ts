import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGradeDescription, safeParseJson } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { grade, availableHours = 3, weakSubjects = [], userApiKey } = await req.json();

    const gradeContext = getGradeDescription(grade || '1_em');
    const prompt = `
Você é um psicopedagogo e especialista em alta performance nos estudos para alunos da Educação Básica.
Crie um Cronograma Semanal de Estudos personalizado para um aluno do ${gradeContext}.

Parâmetros:
- Horas disponíveis por dia: ${availableHours} horas
- Disciplinas prioritárias/dificuldades: ${weakSubjects.length ? weakSubjects.join(', ') : 'Matemática, Português, Ciências'}

Responda ESTRITAMENTE em formato JSON com o seguinte formato (sem marcações markdown fora do JSON):
{
  "title": "Cronograma Semanal Personalizado",
  "weeklyPlan": [
    {
      "dayName": "Segunda-feira",
      "subjects": [
        {
          "subject": "Matemática",
          "topic": "Resolução de Problemas e Exercícios",
          "duration": "1h 30min",
          "technique": "Técnica Pomodoro (25 min estudo / 5 min pausa) + Questões"
        },
        {
          "subject": "História",
          "topic": "Leitura Ativa e Mapa Mental",
          "duration": "1h",
          "technique": "Fichamento e Resumo Visual"
        }
      ]
    },
    {
      "dayName": "Terça-feira",
      "subjects": [
        {
          "subject": "Português",
          "topic": "Gramática e Leitura de Texto",
          "duration": "1h 30min",
          "technique": "Estudo Ativo"
        }
      ]
    },
    { "dayName": "Quarta-feira", "subjects": [] },
    { "dayName": "Quinta-feira", "subjects": [] },
    { "dayName": "Sexta-feira", "subjects": [] },
    { "dayName": "Sábado", "subjects": [] }
  ]
}
`;

    try {
      const genAI = getGeminiClient(userApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '';

      const parsed = safeParseJson<any>(text);
      if (parsed && Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length > 0) {
        return NextResponse.json(parsed);
      }
    } catch (aiErr: any) {
      console.warn("AI schedule generation failed, providing fallback schedule:", aiErr?.message);
    }

    return NextResponse.json({
      title: `Cronograma Semanal de Estudos (${availableHours}h/dia)`,
      weeklyPlan: [
        {
          dayName: "Segunda-feira",
          subjects: [
            { subject: "Matemática", topic: "Revisão Teórica e Exercícios", duration: "1h 30m", technique: "Pomodoro + Resolução de Questões" },
            { subject: "História", topic: "Leitura de Capítulos e Anotações", duration: "1h", technique: "Resumo Estruturado" }
          ]
        },
        {
          dayName: "Terça-feira",
          subjects: [
            { subject: "Português", topic: "Interpretação de Texto e Gramática", duration: "1h 30m", technique: "Análise Sintática Ativa" },
            { subject: "Biologia", topic: "Conceitos de Ecologia / Citologia", duration: "1h", technique: "Criação de Mapa Mental" }
          ]
        },
        {
          dayName: "Quarta-feira",
          subjects: [
            { subject: "Física", topic: "Fórmulas e Resolução de Problemas", duration: "1h 30m", technique: "Estudo Dirigido" },
            { subject: "Geografia", topic: "Geopolítica e Cartografia", duration: "1h", technique: "Flashcards e Leitura" }
          ]
        },
        {
          dayName: "Quinta-feira",
          subjects: [
            { subject: "Química", topic: "Tabela Periódica e Reações", duration: "1h 30m", technique: "Pomodoro + Exercícios" },
            { subject: "Literatura", topic: "Escolas Literárias e Análise de Obras", duration: "1h", technique: "Leitura Crítica" }
          ]
        },
        {
          dayName: "Sexta-feira",
          subjects: [
            { subject: "Simulado Semanal", topic: "Questões Múltipla Escolha (Todas as Matérias)", duration: "2h", technique: "Simulação de Prova sem Consulta" }
          ]
        },
        {
          dayName: "Sábado",
          subjects: [
            { subject: "Revisão dos Erros", topic: "Análise das questões erradas no Simulado", duration: "1h 30m", technique: "Feedback Ativo com IA" }
          ]
        }
      ]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar cronograma.' }, { status: 500 });
  }
}
