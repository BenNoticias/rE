import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getGradeDescription, safeParseJson } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, topic, userApiKey } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'O tópico para o mapa mental é obrigatório.' }, { status: 400 });
    }

    const gradeContext = getGradeDescription(grade || '1_em');
    const prompt = `
Você é um especialista em mapas mentais pedagógicos e diagramação visual da aprendizagem.
Gere um MAPA MENTAL MULTINÍVEL APROFUNDADO em JSON para o tema "${topic}" na disciplina de "${subject}".

Público-alvo do estudante: ${gradeContext}

Instruções para a Estrutura do Grafo:
- Crie um nó "root" (Conceito Central).
- Crie de 3 a 4 nós "main" (Subtópicos Principais).
- Crie de 4 a 6 nós "sub" (Detalhamentos, Exemplos Práticos, Fórmulas e Erros Comuns ligados aos nós "main").
- Todas as conexões "edges" devem conectar a raiz aos nós principais, e os nós principais aos seus respetivos nós de detalhe.

Responda ESTRITAMENTE em formato JSON (sem caracteres fora do JSON):
{
  "title": "Mapa Mental: ${topic}",
  "nodes": [
    { "id": "root", "label": "${topic}", "description": "Conceito central de estudo", "type": "root", "color": "#0c8de9" },
    { "id": "n1", "label": "Bases Teóricas", "description": "Princípios fundamentais", "type": "main", "color": "#9333ea" },
    { "id": "n2", "label": "Fórmulas & Regras", "description": "Estrutura lógica e equações", "type": "main", "color": "#10b981" },
    { "id": "n3", "label": "Aplicações Práticas", "description": "Uso no cotidiano e vestibulares", "type": "main", "color": "#f59e0b" },
    { "id": "n1_1", "label": "Definição Técnica", "description": "Vocabulário científico chave", "type": "sub", "color": "#a855f7" },
    { "id": "n2_1", "label": "Exemplo de Cálculo", "description": "Passo a passo de resolução", "type": "sub", "color": "#34d399" },
    { "id": "n3_1", "label": "Questão Típica ENEM", "description": "Como é cobrado em provas", "type": "sub", "color": "#fbbf24" }
  ],
  "edges": [
    { "id": "e_r_n1", "source": "root", "target": "n1", "label": "Fundamentos" },
    { "id": "e_r_n2", "source": "root", "target": "n2", "label": "Leis & Regras" },
    { "id": "e_r_n3", "source": "root", "target": "n3", "label": "Aplicações" },
    { "id": "e_n1_1", "source": "n1", "target": "n1_1", "label": "Detalhamento" },
    { "id": "e_n2_1", "source": "n2", "target": "n2_1", "label": "Exemplo" },
    { "id": "e_n3_1", "source": "n3", "target": "n3_1", "label": "Exame" }
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
      if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        return NextResponse.json(parsed);
      }
    } catch (aiErr: any) {
      console.warn("AI mindmap generation failed, providing rich multi-level fallback:", aiErr?.message);
    }

    return NextResponse.json({
      title: `Mapa Mental: ${topic}`,
      nodes: [
        { id: "root", label: topic, description: `Conceito Integrador de ${subject} (${grade})`, type: "root", color: "#0c8de9" },
        { id: "n1", label: "Definição & Conceitos", description: "Bases conceituais e princípios primários", type: "main", color: "#9333ea" },
        { id: "n2", label: "Fórmulas & Regras", description: "Equações essenciais e relações operacionais", type: "main", color: "#10b981" },
        { id: "n3", label: "Aplicações & Cotidiano", description: "Problemas reais e interpretação de dados", type: "main", color: "#f59e0b" },
        { id: "n4", label: "Erros Comuns & Pegadinhas", description: "Pontos de atenção para exames e provas", type: "main", color: "#ef4444" },
        { id: "n1_1", label: "Terminologia Chave", description: "Vocabulário científico e definições formais", type: "sub", color: "#c084fc" },
        { id: "n2_1", label: "Exemplo Passo a Passo", description: "Demonstração prática da aplicação de regras", type: "sub", color: "#34d399" },
        { id: "n3_1", label: "Foco no ENEM / Provas", description: "Estilo de cobrança em exames vestibulares", type: "sub", color: "#fbbf24" }
      ],
      edges: [
        { id: "e_r_n1", source: "root", target: "n1", label: "Fundamentos" },
        { id: "e_r_n2", source: "root", target: "n2", label: "Estrutura" },
        { id: "e_r_n3", source: "root", target: "n3", label: "Uso Prático" },
        { id: "e_r_n4", source: "root", target: "n4", label: "Atenção" },
        { id: "e_n1_n1_1", source: "n1", target: "n1_1", label: "Termos" },
        { id: "e_n2_n2_1", source: "n2", target: "n2_1", label: "Resolução" },
        { id: "e_n3_n3_1", source: "n3", target: "n3_1", label: "Vestibular" }
      ]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar mapa mental.' }, { status: 500 });
  }
}
