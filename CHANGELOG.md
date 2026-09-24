# 📋 Log de Atualizações (Changelog) - Estuda AI

Todas as alterações notáveis, melhorias, novos recursos e correções no sistema **Estuda AI** estão documentadas neste arquivo.

---

## 🚀 [v0.4] - Atualização de Vestibulares, Correção de Redações & Central de Notificações

### 🆓 1. Plataforma 100% Gratuita & Remoção de Monetização
- **Acesso Ilimitado**: Removidos todos os pop-ups, avisos, limites ou propagandas referentes aos planos "Pro" ou "Premium".
- **Desbloqueio de Recursos**: Todas as funcionalidades de IA, resumos, simulados e cronogramas estão 100% abertas a todos os usuários gratuitamente.

### 🔔 2. Central de Notificações Dinâmicas Funcionais
- **Módulo de Notificações (`NotificationCenter.tsx` & `src/lib/storage.ts`)**:
  - Menu popover interativo acessado no sino do cabeçalho com indicador numérico de alertas não lidos (*badge counter*).
  - Histórico de alertas ordenado por data com opção de marcar notificações individuais ou todas como lidas, além de opção de limpar histórico.
  - Eventos de disparo dinâmico:
    - **Simulados**: Notificação imediata ao concluir simulados com pontuação e XP conquistado.
    - **Ranking & Streaks**: Notificações automáticas de alteração de patamar, subida de nível e manutenção de ofensivas diárias.
    - **Cronograma**: Lembretes dinâmicos dos estudos do dia.
    - **Redação**: Notificação assim que o parecer pedagógico da redação é gerado pela IA.

### 🎓 3. Nova Aba: Vestibulares & Correção de Redação com IA Gemini
- **Acervo de Provas e Gabaritos Comentados (`VestibularesModule.tsx`)**:
  - Organização de exames por banca (ENEM, FUVEST, UNICAMP, UERJ, ITA) e ano de aplicação.
  - Questões com gabarito oficial comentado passo a passo pela equipe pedagógica.
  - Modo **Simulado de Prova Anterior com Cronômetro**: temporizador em tempo real, correção automática e recompensa de +150 XP.
- **Sistema de Correção de Redação (`/api/gemini/essay` & `VestibularesModule.tsx`)**:
  - Seleção de modelos oficiais de correção (ENEM, FUVEST, UNICAMP, UERJ, ITA).
  - Temas pré-cadastrados com opção para inclusão de temas personalizados.
  - Integração com a API do Gemini configurada para avaliar o texto de acordo com as competências oficiais (ex: as 5 competências do ENEM).
  - Relatório de avaliação completo: pontuação final, nota por competência, pontos fortes, aspectos a melhorar, parecer da banca e reescrita sugerida de trechos.
  - Histórico de redações salvas para consulta contínua do estudante.

### 🏷️ 4. Atualização de Versão
- Indicador de versão atualizado no sistema, cabeçalho e menu lateral para **v0.4**.

---

## 🚀 [v1.1.0 / v0.3] - Atualização de Funcionalidades, Segurança & Gamificação

### 🔐 Segurança & Autenticação
- Sanitização de inputs, medidor de força de senha interativo e *rate limiting*.
- Modal unificado com navegação fluida entre Login, Cadastro e Recuperação de Senha.

### 🏆 Gamificação & Ranking
- 7 Tiers de progresso: Bronze, Prata, Ouro, Platina, Diamante, Mestre e Lenda.
- Visualização de XP, ofensiva (*streak*) e badges conquistados.

---

*Estuda AI — Transformando a rotina de estudos com Inteligência Artificial.*
