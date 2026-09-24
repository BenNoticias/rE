# 📋 Log de Atualizações (Changelog) - Estuda AI

Todas as alterações notáveis, melhorias, novos recursos e correções no sistema **Estuda AI** estão documentadas neste arquivo.

---

## 🚀 [v1.1.0] - Atualização de Funcionalidades, Segurança & Gamificação

### 🔐 Segurança & Autenticação
- **Novo Módulo de Segurança (`src/lib/security.ts`)**:
  - Sanitização rigorosa de inputs para prevenção de XSS e injeção de dados.
  - Medidor de força de senha interativo no cadastro/alteração de senha.
  - Controle de taxa de requisições (*Rate Limiting*) para tentativas de autenticação.
  - Criptografia e hashing seguro para armazenamento de tokens locais.
- **Autenticação Otimizada (`AuthModal.tsx` & `LoginPage.tsx`)**:
  - Modal unificado com navegação fluida entre Login, Cadastro e Recuperação de Senha.
  - Suporte a login social via Google e GitHub com Supabase OAuth.
  - Integração obrigatória de aceite de Termos de Uso e Política de Privacidade na criação de conta.

### ⚖️ Conformidade Legal & Privacidade (LGPD/GDPR)
- **Modal de Termos e Privacidade (`LegalModal.tsx`)**:
  - Leitura e navegação completa entre Termos de Serviço e Política de Privacidade.
  - Opção de gerenciamento de consentimento diretamente pelo usuário.
- **Direitos de Dados Pessoais (`SettingsModal.tsx`)**:
  - Função de exportação total dos dados de estudo do usuário (JSON).
  - Opção de solicitação de exclusão definitiva da conta e dados de estudo.

### ⚙️ Painel de Configurações Redenhado
- **Navegação em Abas Temáticas (`SettingsModal.tsx`)**:
  - **Perfil**: Customização de foto de perfil, nome, bio e ano letivo.
  - **Segurança**: Alteração de senha, autenticação de dois fatores (2FA) e encerramento de sessões ativas.
  - **Privacidade & Termos**: Visibilidade no ranking e consentimentos LGPD.
  - **Backup & Restauração**: Exportação e importação de backups do progresso de estudos.
  - **Chave de API Gemini**: Configuração de chave individual para uso do serviço de IA.
  - **Notificações**: Lembretes customizados de estudo, metas diárias e boletim semanal.

### 🏆 Gamificação & Ranking (Leaderboard)
- **Novo Sistema de Patamares & Divisões (`LeaderboardModule.tsx`)**:
  - 7 Tiers de progresso: Bronze, Prata, Ouro, Platina, Diamante, Mestre e Lenda.
  - Visualização de XP, ofensiva (*streak* de dias seguidos) e badges conquistados.
- **Filtros Temporais & Busca**:
  - Alternância entre Ranking Semanal, Mensal e Geral (*All-Time*).
  - Busca rápida de estudantes por nome, nível ou pontuação.
  - Destaque fixo para a posição atual do estudante logado.

### 📊 Painel Principal (Dashboard)
- **Métricas em Tempo Real (`Dashboard.tsx`)**:
  - Visualização gráfica de progresso semanal por disciplina.
  - Indicadores atualizados de simulados concluídos, taxa de acerto (%) e cards de revisão.
  - Acesso rápido direto para Simulados, Mapas Mentais, Flashcards e Cronogramas.

### 💾 Persistência & Sincronização
- **Arquitetura de Dados Híbrida (`src/lib/storage.ts` & `src/lib/supabase.ts`)**:
  - Sincronização em nuvem automática via Supabase com fallback seguro em LocalStorage.
  - Recálculo automático de níveis, XP e posições no ranking a cada simulado concluído.

---

*Estuda AI — Transformando a rotina de estudos com Inteligência Artificial.*
