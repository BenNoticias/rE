import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent, getGradeDescription, safeParseJson } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, topic, userApiKey } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'O tópico para o mapa mental é obrigatório.' }, { status: 400 });
    }

    const gradeContext = getGradeDescription(grade || '1_em');
    const prompt = `
Você é um especialista pedagógico em mapas mentais e diagramação visual da aprendizagem no Brasil.
Gere um MAPA MENTAL MULTINÍVEL APROFUNDADO (Estatisticamente e Pedagogicamente estruturado) em JSON para o tema "${topic}" na disciplina de "${subject}".

Nível do Estudante: ${gradeContext}

Instruções para a Estrutura Multinível do Grafo:
1. Nível 1 - Conceito Central ("root"): 1 nó principal representando o tema central "${topic}".
2. Nível 2 - Subtemas Principais ("main"): 3 a 4 nós representando os eixos centrais do conteúdo (ex: "Fundamentos & Definições", "Regras & Fórmulas", "Aplicações & Cotidiano", "Erros & Pegadinhas").
3. Nível 3 - Definições, Exemplos e Detalhes ("sub"): 6 a 8 nós de aprofundamento encadeados diretamente aos nós do Nível 2 ("main"), contendo explicações didáticas, vocabulário técnico, exemplos práticos do dia a dia e fórmulas.

Responda ESTRITAMENTE em formato JSON no seguinte formato (sem qualquer texto fora do JSON):
{
  "title": "Mapa Mental: ${topic}",
  "nodes": [
    { "id": "root", "label": "${topic}", "description": "Conceito central integrador do estudo de ${topic} em ${subject}.", "type": "root", "color": "#0c8de9" },
    { "id": "n1", "label": "Eixo 1: Conceitos & Definições", "description": "Bases conceituais e princípios fundamentais.", "type": "main", "color": "#9333ea" },
    { "id": "n2", "label": "Eixo 2: Regras & Fórmulas", "description": "Estrutura operacional e equações principais.", "type": "main", "color": "#10b981" },
    { "id": "n3", "label": "Eixo 3: Aplicações & Cotidiano", "description": "Estudo de caso e uso prático no dia a dia.", "type": "main", "color": "#f59e0b" },
    { "id": "n4", "label": "Eixo 4: Foco nos Exames & Pegadinhas", "description": "Pontos de atenção e armadilhas em provas escolares.", "type": "main", "color": "#ef4444" },
    
    { "id": "n1_1", "label": "Terminologia Científica", "description": "Vocabulário técnico essencial e significados dos termos chave de ${topic}.", "type": "sub", "color": "#a855f7" },
    { "id": "n1_2", "label": "Princípio Matriz", "description": "Lei ou teoria fundamental que sustenta o assunto.", "type": "sub", "color": "#c084fc" },
    { "id": "n2_1", "label": "Demonstração de Cálculo", "description": "Passo a passo de aplicação de equações e regras operacionais.", "type": "sub", "color": "#34d399" },
    { "id": "n2_2", "label": "Variáveis & Unidades", "description": "Identificação das grandezas envolvidas e suas unidades de medida.", "type": "sub", "color": "#6ee7b7" },
    { "id": "n3_1", "label": "Exemplo do Dia a Dia", "description": "Como este fenômeno/regra manifesta-se na rotina diária do estudante.", "type": "sub", "color": "#fbbf24" },
    { "id": "n3_2", "label": "Conexão Interdisciplinar", "description": "Relação de ${topic} com outras disciplinas e temas atuais.", "type": "sub", "color": "#fcd34d" },
    { "id": "n4_1", "label": "Distratores Típicos", "description": "Erros conceituais comuns cometidos pelos alunos em exames.", "type": "sub", "color": "#f87171" }
  ],
  "edges": [
    { "id": "e_r_n1", "source": "root", "target": "n1", "label": "Fundamentação" },
    { "id": "e_r_n2", "source": "root", "target": "n2", "label": "Operação" },
    { "id": "e_r_n3", "source": "root", "target": "n3", "label": "Prática" },
    { "id": "e_r_n4", "source": "root", "target": "n4", "label": "Atenção" },
    { "id": "e_n1_n1_1", "source": "n1", "target": "n1_1", "label": "Vocabulário" },
    { "id": "e_n1_n1_2", "source": "n1", "target": "n1_2", "label": "Princípios" },
    { "id": "e_n2_n2_1", "source": "n2", "target": "n2_1", "label": "Resolução" },
    { "id": "e_n2_n2_2", "source": "n2", "target": "n2_2", "label": "Unidades" },
    { "id": "e_n3_n3_1", "source": "n3", "target": "n3_1", "label": "Cotidiano" },
    { "id": "e_n3_n3_2", "source": "n3", "target": "n3_2", "label": "Conexões" },
    { "id": "e_n4_n4_1", "source": "n4", "target": "n4_1", "label": "Erros Típicos" }
  ]
}
`;

    try {
      const text = await generateGeminiContent({
        prompt,
        userApiKey,
        temperature: 0.7,
        responseMimeType: 'application/json',
      });

      const parsed = safeParseJson<any>(text);
      if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        return NextResponse.json(parsed);
      }
    } catch (aiErr: any) {
      console.warn('AI mindmap generation failed, providing rich fallback:', aiErr?.message);
    }

    return NextResponse.json({
      title: `Mapa Mental: ${topic}`,
      nodes: [
        { id: "root", label: topic, description: `Conceito Integrador de ${subject} para o ${grade}`, type: "root", color: "#0c8de9" },
        { id: "n1", label: "Definição & Conceitos", description: "Bases conceituais e princípios primários do tema.", type: "main", color: "#9333ea" },
        { id: "n2", label: "Fórmulas & Regras", description: "Equações essenciais e relações operacionais.", type: "main", color: "#10b981" },
        { id: "n3", label: "Aplicações & Cotidiano", description: "Problemas reais, estudo de caso e contexto diário.", type: "main", color: "#f59e0b" },
        { id: "n4", label: "Erros Comuns & Exames", description: "Pontos de atenção para vestibulares e exames oficiais.", type: "main", color: "#ef4444" },
        { id: "n1_1", label: "Terminologia Chave", description: "Vocabulário científico e definições formais em " + subject + ".", type: "sub", color: "#c084fc" },
        { id: "n1_2", label: "Princípio Matriz", description: "Lei ou fundamento que rege " + topic + ".", type: "sub", color: "#a855f7" },
        { id: "n2_1", label: "Exemplo Passo a Passo", description: "Demonstração prática da aplicação de regras ou fórmulas.", type: "sub", color: "#34d399" },
        { id: "n2_2", label: "Unidades & Relações", description: "Relação entre as variáveis e grandezas medidas.", type: "sub", color: "#6ee7b7" },
        { id: "n3_1", label: "Foco no ENEM / Provas", description: "Estilo de cobrança típico em questões contextualizadas.", type: "sub", color: "#fbbf24" },
        { id: "n3_2", label: "Aplicação Prática", description: "Exemplo no dia a dia dos alunos e na tecnologia.", type: "sub", color: "#fcd34d" },
        { id: "n4_1", label: "Pegadinhas Frequentes", description: "Confusão entre conceitos parecidos em " + topic + ".", type: "sub", color: "#f87171" }
      ],
      edges: [
        { id: "e_r_n1", source: "root", target: "n1", label: "Fundamentos" },
        { id: "e_r_n2", source: "root", target: "n2", label: "Estrutura" },
        { id: "e_r_n3", source: "root", target: "n3", label: "Uso Prático" },
        { id: "e_r_n4", source: "root", target: "n4", label: "Atenção" },
        { id: "e_n1_n1_1", source: "n1", target: "n1_1", label: "Termos" },
        { id: "e_n1_n1_2", source: "n1", target: "n1_2", label: "Base" },
        { id: "e_n2_n2_1", source: "n2", target: "n2_1", label: "Resolução" },
        { id: "e_n2_n2_2", source: "n2", target: "n2_2", label: "Grandezas" },
        { id: "e_n3_n3_1", source: "n3", target: "n3_1", label: "Exames" },
        { id: "e_n3_n3_2", source: "n3", target: "n3_2", label: "Cotidiano" },
        { id: "e_n4_n4_1", source: "n4", target: "n4_1", label: "Alertas" }
      ]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar mapa mental.' }, { status: 500 });
  }
}
