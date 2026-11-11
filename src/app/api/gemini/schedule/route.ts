import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJson, getGradeDescription } from '@/lib/gemini';

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

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
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

    const parsed = await generateGeminiJson<any>(prompt, userApiKey);

    if (parsed && Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length > 0) {
      return NextResponse.json(parsed);
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
            { subject: "Filosofia & Sociologia", topic: "Pensadores Contemporâneos e Temas Sociais", duration: "1h", technique: "Debate e Análise Argumentativa" },
            { subject: "Revisão Geral", topic: "Simulado Semanal de Fixação", duration: "1h 30m", technique: "Simulação de Prova Cronometrada" }
          ]
        },
        {
          dayName: "Sábado",
          subjects: [
            { subject: "Redação", topic: "Produção de Texto Modelo ENEM / Vestibular", duration: "1h 30m", technique: "Estruturação Argumentativa e Proposta de Intervenção" },
            { subject: "Correção de Erros", topic: "Análise do Gabarito dos Simulados", duration: "1h", technique: "Caderno de Erros" }
          ]
        }
      ]
    });

  } catch (err: any) {
    console.error('[Schedule API] Erro ao processar:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar cronograma de estudos.' }, { status: 500 });
  }
}
