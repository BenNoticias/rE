import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJson, getGradeDescription } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { grade, availableHours = 3, weakSubjects = [], userApiKey } = await req.json();

    const gradeContext = getGradeDescription(grade || '1_em');
    const subjectsList = Array.isArray(weakSubjects) && weakSubjects.length > 0
      ? weakSubjects
      : ['Matemática', 'Português', 'História'];

    const prompt = `
Você é um psicopedagogo e especialista em alta performance e planejamento de estudos para a Educação Básica e Vestibulares.
Crie um Cronograma Semanal de Estudos de 7 dias completos (Segunda-feira a Domingo) personalizado para um estudante do ${gradeContext}.

REGRAS OBRIGATÓRIAS E RESTRITAS:
1. MATÉRIAS EXCLUSIVAS: Utilize APENAS E EXCLUSIVAMENTE as seguintes disciplinas fornecidas pelo estudante:
   [ ${subjectsList.join(', ')} ]
   É ESTRITAMENTE PROIBIDO incluir qualquer matéria, disciplina ou atividade que não esteja na lista acima. Se houver poucas matérias, distribua-as ao longo da semana variando os temas e técnicas.
2. 7 DIAS COMPLETOS: O array "weeklyPlan" DEVE conter exatamente 7 dias: "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado" e "Domingo". No Domingo, pode ser uma rotina mais leve de revisão das matérias selecionadas ou descanso planejado com revisão leve.
3. CARGA HORÁRIA DIÁRIA: O total diário aproximado deve respeitar cerca de ${availableHours} hora(s) por dia.
4. ROTATIVIDADE OBRIGATÓRIA DE TÉCNICAS DE ESTUDO: Sempre que uma matéria se repetir ao longo da semana, a técnica de estudo recomendada DEVE SER OBRIGATORIAMENTE DIFERENTE da utilizada nos dias anteriores para essa mesma matéria. Alterne ativamente entre:
   - Resolução Ativa de Questões e Análise de Gabarito
   - Resumo Ativo / Fichamento Sintético
   - Construção de Mapa Mental Hierárquico
   - Flashcards com Repetição Espaçada
   - Técnica Feynman (ensinar o conceito em voz alta com palavras próprias)
   - Leitura Crítica e Auto-interrogação
   - Caderno de Erros e Correção Comentada

Responda ESTRITAMENTE em formato JSON com o seguinte esquema:
{
  "title": "Cronograma de Estudos Personalizado (${availableHours}h/dia)",
  "weeklyPlan": [
    {
      "dayName": "Segunda-feira",
      "subjects": [
        {
          "subject": "Nome exato da matéria da lista",
          "topic": "Descrição do tema ou objetivo da sessão de estudo",
          "duration": "1h 30m",
          "technique": "Técnica pedagógica rotativa recomendada"
        }
      ]
    },
    { "dayName": "Terça-feira", "subjects": [...] },
    { "dayName": "Quarta-feira", "subjects": [...] },
    { "dayName": "Quinta-feira", "subjects": [...] },
    { "dayName": "Sexta-feira", "subjects": [...] },
    { "dayName": "Sábado", "subjects": [...] },
    { "dayName": "Domingo", "subjects": [...] }
  ]
}
`;

    const parsed = await generateGeminiJson<any>(prompt, userApiKey);

    if (parsed && Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length >= 6) {
      // Garantir que todas as matérias geradas sejam estritamente as selecionadas
      const normalizedPlan = parsed.weeklyPlan.map((d: any) => ({
        ...d,
        subjects: Array.isArray(d.subjects) 
          ? d.subjects.filter((s: any) => subjectsList.some((allowed: string) => allowed.toLowerCase() === (s.subject || '').toLowerCase() || (s.subject || '').toLowerCase().includes(allowed.toLowerCase())))
          : []
      }));
      return NextResponse.json({ ...parsed, weeklyPlan: normalizedPlan });
    }

    // Fallback inteligente garantindo apenas matérias selecionadas e 7 dias
    const days = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo',
    ];

    const techniquesPool = [
      'Resolução Ativa de Questões e Caderno de Erros',
      'Elaboração de Mapa Mental Hierárquico',
      'Técnica Feynman (autoexplicação sem consulta)',
      'Flashcards e Repetição Espaçada',
      'Resumo Ativo e Fichamento Conceitual',
      'Simulado Cronometrado de Fixação',
      'Revisão Ativa por Tópicos Chave',
    ];

    const fallbackPlan = days.map((dayName, idx) => {
      const subjectIndex = idx % subjectsList.length;
      const sub = subjectsList[subjectIndex];
      const technique = techniquesPool[idx % techniquesPool.length];

      return {
        dayName,
        subjects: [
          {
            subject: sub,
            topic: `Estudo focado e aprofundamento prático em ${sub}`,
            duration: `${Math.max(1, availableHours)}h`,
            technique,
          },
        ],
      };
    });

    return NextResponse.json({
      title: `Cronograma Semanal de Estudos (${availableHours}h/dia)`,
      weeklyPlan: fallbackPlan,
    });
  } catch (err: any) {
    console.error('[Schedule API] Erro ao processar:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar cronograma de estudos.' },
      { status: 500 }
    );
  }
}
