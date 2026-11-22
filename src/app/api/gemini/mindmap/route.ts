import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJson, getGradeDescription } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, topic, userApiKey } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'O tópico para o mapa mental é obrigatório.' }, { status: 400 });
    }

    const gradeContext = getGradeDescription(grade || '1_em');
    const prompt = `
Você é um especialista sênior em pedagogia visual, neurociência da aprendizagem e mapas mentais conceituais.
Gere um MAPA MENTAL PROFUNDO, HIERÁRQUICO E MULTINÍVEL para o tema "${topic}" na disciplina de "${subject}".

Público-alvo do estudante: ${gradeContext}

ESTRUTURA HIERÁRQUICA MULTINÍVEL OBRIGATÓRIA (4 NÍVEIS):
1. Nível 0 ("root"): 1 Nó Raiz com o Tema Central "${topic}".
2. Nível 1 ("main"): 3 a 4 Tópicos Principais / Eixos Fundamentais (ex: "Fundamentos & Definição", "Mecanismos & Fórmulas", "Aplicações Práticas & Sociedade", "Pegadinhas no ENEM/Vestibulares").
3. Nível 2 ("sub"): Pelo menos 2 Subtópicos ramificados a partir de cada nó principal (level: 2).
4. Nível 3 ("detail"): Exemplos reais, fórmulas passo a passo, conexões didáticas ou explicações conceituais aprofundadas ramificadas a partir dos subtópicos (level: 3).

TEXTOS DIDÁTICOS E RICOS:
- Cada nó deve ter um "label" claro e direto.
- Cada nó DEVE conter uma "description" didática, rica, bem explicada e detalhada (não seja telegráfico: explique o porquê, a utilidade ou a regra para o aluno).
- Atribua um "level" (0, 1, 2 ou 3) e o "type" correspondente ('root', 'main', 'sub', 'detail').
- Indique conexões claras ("edges") ligando a raiz aos principais, os principais aos subtópicos, e os subtópicos aos nós de detalhe/exemplo com "label" de relação conexa.

Responda ESTRITAMENTE em formato JSON no seguinte modelo:
{
  "title": "Mapa Mental Completo: ${topic}",
  "nodes": [
    { "id": "root", "label": "${topic}", "description": "Conceito central integrador em ${subject}.", "type": "root", "level": 0, "color": "#0284c7" },
    { "id": "m1", "parentId": "root", "label": "Bases Teóricas e Conceito", "description": "Explicação completa e fundamentação científica sobre o que é ${topic}.", "type": "main", "level": 1, "color": "#7c3aed" },
    { "id": "s1_1", "parentId": "m1", "label": "Definição Essencial", "description": "O conceito em termos simples e precisos que costumam aparecer em enunciados.", "type": "sub", "level": 2, "color": "#9333ea" },
    { "id": "d1_1_1", "parentId": "s1_1", "label": "Exemplo Prático Cotidiano", "description": "Como observar esse fenômeno ou conceito no mundo real com clareza.", "type": "detail", "level": 3, "color": "#a855f7" },
    { "id": "m2", "parentId": "root", "label": "Equações e Mecanismos", "description": "As regras, fórmulas matemáticas ou passos sistemáticos que regem o tópico.", "type": "main", "level": 1, "color": "#059669" },
    { "id": "s2_1", "parentId": "m2", "label": "Relações Matemáticas/Lógicas", "description": "Passo a passo das operações fundamentais e grandezas envolvidas.", "type": "sub", "level": 2, "color": "#10b981" },
    { "id": "d2_1_1", "parentId": "s2_1", "label": "Aplicação em Problema Típico", "description": "Resolução comentada de um modelo de questão frequente.", "type": "detail", "level": 3, "color": "#34d399" },
    { "id": "m3", "parentId": "root", "label": "Aplicações e Contexto ENEM", "description": "Análise interdisciplinar e impactos práticos do tema.", "type": "main", "level": 1, "color": "#d97706" },
    { "id": "s3_1", "parentId": "m3", "label": "Como o ENEM Cobra", "description": "Padrões de exigência nas provas nacionais e vestibulares.", "type": "sub", "level": 2, "color": "#f59e0b" },
    { "id": "d3_1_1", "parentId": "s3_1", "label": "Ponto de Atenção Crítico", "description": "Pegadinha comum entre alternativas e como não errar.", "type": "detail", "level": 3, "color": "#fbbf24" }
  ],
  "edges": [
    { "id": "e_root_m1", "source": "root", "target": "m1", "label": "Fundamentos" },
    { "id": "e_m1_s1_1", "source": "m1", "target": "s1_1", "label": "Especifica" },
    { "id": "e_s1_1_d1", "source": "s1_1", "target": "d1_1_1", "label": "Demonstração" },
    { "id": "e_root_m2", "source": "root", "target": "m2", "label": "Operações" },
    { "id": "e_m2_s2_1", "source": "m2", "target": "s2_1", "label": "Fórmulas" },
    { "id": "e_s2_1_d2", "source": "s2_1", "target": "d2_1_1", "label": "Exemplo" },
    { "id": "e_root_m3", "source": "root", "target": "m3", "label": "Exames" },
    { "id": "e_m3_s3_1", "source": "m3", "target": "s3_1", "label": "Cobrança" },
    { "id": "e_s3_1_d3", "source": "s3_1", "target": "d3_1_1", "label": "Alerta" }
  ]
}
`;

    const parsed = await generateGeminiJson<any>(prompt, userApiKey);

    if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length >= 5) {
      return NextResponse.json(parsed);
    }

    // High quality rich fallback
    return NextResponse.json({
      title: `Mapa Mental Completo: ${topic}`,
      nodes: [
        { 
          id: "root", 
          label: topic, 
          description: `Conceito central integrador de ${subject} para ${gradeContext}.`, 
          type: "root", 
          level: 0, 
          color: "#0284c7" 
        },
        { 
          id: "m1", 
          parentId: "root", 
          label: "Bases Teóricas & Definição", 
          description: `Fundamentação teórica de ${topic}. Compreender os princípios que sustentam esse conceito é vital para a resolução de questões dissertativas e objetivas.`, 
          type: "main", 
          level: 1, 
          color: "#7c3aed" 
        },
        { 
          id: "s1_1", 
          parentId: "m1", 
          label: "Conceito Fundamental", 
          description: `O ponto de partida lógico para entender ${topic}. Explica o porquê da existência dessa regra ou mecanismo.`, 
          type: "sub", 
          level: 2, 
          color: "#9333ea" 
        },
        { 
          id: "d1_1", 
          parentId: "s1_1", 
          label: "Exemplo Prático Ilustrado", 
          description: `Aplicação direta do conceito em uma situação observável do cotidiano ou em experimentos clássicos.`, 
          type: "detail", 
          level: 3, 
          color: "#a855f7" 
        },
        { 
          id: "m2", 
          parentId: "root", 
          label: "Leis, Relações & Fórmulas", 
          description: `Equações matemáticas, regras de causalidade e relações proporcionais aplicáveis ao tema de ${topic}.`, 
          type: "main", 
          level: 1, 
          color: "#059669" 
        },
        { 
          id: "s2_1", 
          parentId: "m2", 
          label: "Passo a Passo de Cálculo", 
          description: `Estrutura lógica de resolução: isolar as variáveis, conferir as unidades de medida e aplicar os teoremas.`, 
          type: "sub", 
          level: 2, 
          color: "#10b981" 
        },
        { 
          id: "d2_1", 
          parentId: "s2_1", 
          label: "Exemplo de Aplicação", 
          description: `Resolução guiada passo a passo demonstrando como simplificar dados e chegar à resposta correta.`, 
          type: "detail", 
          level: 3, 
          color: "#34d399" 
        },
        { 
          id: "m3", 
          parentId: "root", 
          label: "Interdisciplinaridade & ENEM", 
          description: `Como ${topic} se conecta a outras áreas do conhecimento e como os vestibulares costumam cobrar contextualização.`, 
          type: "main", 
          level: 1, 
          color: "#d97706" 
        },
        { 
          id: "s3_1", 
          parentId: "m3", 
          label: "Padrões de Questões ENEM", 
          description: `Enunciados com gráficos, tabelas ou textos motivadores que exigem interpretação crítica além da teoria pura.`, 
          type: "sub", 
          level: 2, 
          color: "#f59e0b" 
        },
        { 
          id: "d3_1", 
          parentId: "s3_1", 
          label: "Pegadinhas e Distratores", 
          description: `Erros clássicos induzidos pelas alternativas falsas e como eliminá-las com precisão cirúrgica.`, 
          type: "detail", 
          level: 3, 
          color: "#fbbf24" 
        }
      ],
      edges: [
        { id: "e_root_m1", source: "root", target: "m1", label: "Fundamentos" },
        { id: "e_m1_s1_1", source: "m1", target: "s1_1", label: "Conceito" },
        { id: "e_s1_1_d1_1", source: "s1_1", target: "d1_1", label: "Exemplo" },
        { id: "e_root_m2", source: "root", target: "m2", label: "Regras" },
        { id: "e_m2_s2_1", source: "m2", target: "s2_1", label: "Método" },
        { id: "e_s2_1_d2_1", source: "s2_1", target: "d2_1", label: "Prática" },
        { id: "e_root_m3", source: "root", target: "m3", label: "Provas" },
        { id: "e_m3_s3_1", source: "m3", target: "s3_1", label: "ENEM" },
        { id: "e_s3_1_d3_1", source: "s3_1", target: "d3_1", label: "Atenção" }
      ]
    });

  } catch (err: any) {
    console.error('[Mindmap API] Erro ao processar:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar mapa mental.' }, { status: 500 });
  }
}
