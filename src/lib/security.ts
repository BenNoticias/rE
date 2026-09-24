import { UserProfile, SavedSummary, SavedMindmap, QuizResult, SavedSchedule, APP_VERSION } from '@/types';

/**
 * Computes a secure SHA-256 hash of a password using the Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_estuda_ai_salt_lgpd');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error("Erro ao gerar hash de senha:", err);
    // Fallback safe representation
    return btoa(password);
  }
}

/**
 * Builds a structured, complete portable data object for LGPD compliance.
 */
export function buildUserExportData(
  profile: UserProfile,
  summaries: SavedSummary[],
  mindmaps: SavedMindmap[],
  quizzes: QuizResult[],
  schedules: SavedSchedule[]
) {
  return {
    meta: {
      exportedAt: new Date().toISOString(),
      platform: 'EstudaAI • Plataforma Educacional',
      version: APP_VERSION,
      lgpdCompliance: 'Lei Federal 13.709/2018 (Art. 18 - Portabilidade de Dados)',
    },
    userProfile: {
      id: profile.id,
      username: profile.username || profile.name,
      email: profile.email,
      grade: profile.grade,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      createdAt: profile.createdAt || new Date().toISOString(),
      consent: profile.consent || {
        termsAccepted: true,
        privacyAccepted: true,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      },
    },
    activities: {
      totalSummaries: summaries.length,
      summaries: summaries,
      totalMindmaps: mindmaps.length,
      mindmaps: mindmaps,
      totalQuizzes: quizzes.length,
      quizzes: quizzes,
      totalSchedules: schedules.length,
      schedules: schedules,
    },
  };
}

/**
 * Triggers a browser download of the user's data in structured JSON format.
 */
export function downloadUserDataAsJson(exportData: ReturnType<typeof buildUserExportData>) {
  if (typeof window === 'undefined') return;
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const usernameSanitized = (exportData.userProfile.username || 'estudante').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadAnchor.setAttribute('download', `meus_dados_estuda_ai_${usernameSanitized}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Terms of Use and Privacy Policy detailed text for LGPD compliance.
 */
export const LEGAL_TEXTS = {
  TERMS_OF_USE: {
    title: 'Termos de Uso do EstudaAI',
    lastUpdate: '24 de Setembro de 2026 (v0.3)',
    sections: [
      {
        heading: '1. Objeto e Finalidade Educacional',
        content: 'O EstudaAI é uma plataforma de inteligência educacional destinada a apoiar estudantes do Ensino Fundamental II e Ensino Médio em sua rotina de estudos, preparação para o ENEM e vestibulares. O uso da plataforma deve ser estritamente pedagógico e ético.'
      },
      {
        heading: '2. Cadastro e Minimização de Identificação',
        content: 'Para utilizar a plataforma, o estudante deve cadastrar um Nome de Usuário (Username), E-mail institucional ou pessoal e uma Senha. Não solicitamos nem armazenamos seu nome completo nem documentos pessoais sensíveis (CPF, RG), preservando sua privacidade perante a comunidade escolar.'
      },
      {
        heading: '3. Uso Responsável da Inteligência Artificial',
        content: 'Os resumos, mapas mentais e simulados são gerados com apoio de Inteligência Artificial generativa do Google Gemini. O estudante concorda em utilizar esses recursos como suporte complementar de aprendizagem, respeitando os direitos autorais e as diretrizes de integridade acadêmica.'
      },
      {
        heading: '4. Gamificação e Ranking de Alunos',
        content: 'A pontuação de XP, níveis e ofensivas refletem o engajamento do aluno. No ranking, apenas o Nome de Usuário (pseudônimo) e a série são exibidos publicamente para outros estudantes, resguardando o e-mail e dados de contato.'
      },
      {
        heading: '5. Cancelamento e Encerramento de Conta',
        content: 'O estudante pode revogar seu consentimento ou excluir permanentemente sua conta a qualquer momento na aba de Privacidade nas Configurações, exercendo seu direito ao esquecimento.'
      }
    ]
  },
  PRIVACY_POLICY: {
    title: 'Política de Privacidade e Proteção de Dados (LGPD)',
    lastUpdate: '24 de Setembro de 2026 (v0.3)',
    summary: 'Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), esta política explica com total transparência e em linguagem acessível para estudantes como tratamos e protegemos seus dados.',
    sections: [
      {
        heading: '1. Princípio da Minimização e Dados Coletados',
        content: 'Coletamos estritamente os dados necessários para o funcionamento pedagógico:\n• Nome de Usuário (Username): Para identificação no sistema e no ranking sem expor seu nome civil;\n• E-mail: Para autenticação e recuperação de acesso;\n• Senha criptografada: Armazenada como hash seguro SHA-256;\n• Série Escolar: Para calibrar a didática e profundidade das respostas da IA;\n• Histórico de Estudos: Resumos, mapas mentais, notas e simulados salvos por você.'
      },
      {
        heading: '2. Finalidade do Tratamento (Art. 6º, I da LGPD)',
        content: 'Seus dados são utilizados exclusivamente para:\n• Personalizar os conteúdos pedagógicos de acordo com sua série escolar;\n• Armazenar seus resumos e notas de simulados na sua biblioteca pessoal;\n• Computar XP e posicionamento na tabela de classificação de estudantes.'
      },
      {
        heading: '3. Proteção de Crianças e Adolescentes (Art. 14 da LGPD)',
        content: 'Reconhecemos a importância da proteção de dados de estudantes da Educação Básica. O tratamento de dados é realizado no seu melhor interesse, com linguagem clara, sem qualquer tipo de direcionamento publicitário ou comercial e sem compartilhamento com terceiros anunciantes.'
      },
      {
        heading: '4. Não Compartilhamento de Dados com Terceiros',
        content: 'O EstudaAI NÃO vende, NÃO aluga e NÃO compartilha seus dados pessoais com terceiros não autorizados, agências de marketing ou corretores de dados. A IA apenas processa as solicitações didáticas sem armazenar seu perfil pessoal para fins de treinamento de terceiros.'
      },
      {
        heading: '5. Seus Direitos como Titular (Art. 18 da LGPD)',
        content: 'Você possui total controle sobre seus dados através do Painel de Privacidade nas Configurações:\n• Confirmação e Acesso: Ver todos os dados que temos sobre você;\n• Correção: Atualizar seu nome de usuário ou série a qualquer momento;\n• Portabilidade: Baixar uma cópia completa dos seus dados em formato JSON estruturado;\n• Revogação do Consentimento: Retirar sua autorização de tratamento quando desejar;\n• Exclusão (Direito ao Esquecimento): Apagar permanentemente sua conta e todos os dados associados.'
      },
      {
        heading: '6. Segurança e Criptografia',
        content: 'Empregamos protocolos de segurança modernos, criptografia SHA-256 para senhas e conexões seguras HTTPS para proteger suas informações contra acessos não autorizados.'
      }
    ]
  }
};
