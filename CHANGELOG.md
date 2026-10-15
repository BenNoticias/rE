# 📋 Log de Atualizações (Changelog) - The Educator

Todas as alterações notáveis, melhorias, novos recursos e correções no sistema **The Educator** estão documentadas neste arquivo.

---

## 🚀 [v0.6] - Correção do Histórico Geral & Leitor Completo de Redações

### 📚 1. Correção Geral do Sistema de Histórico
- **Salvamento Automático na Geração:** Todos os tipos de conteúdos gerados (Resumos, Mapas Mentais, Simulados, Cronogramas e Redações) agora são registrados automaticamente no armazenamento/banco de dados no momento exato em que são criados.
- **Filtros e Abas Navegáveis:** Adicionado controle por abas e busca textual na tela de histórico (`HistoryModule.tsx`), permitindo alternar entre:
  - **Todos**: Feed cronológico unificado agrupando todos os itens salvos.
  - **Simulados**: Lista de exercícios resolvidos com pontuação e XP conquistado.
  - **Resumos**: Lista de materiais didáticos criados.
  - **Mapas Mentais**: Estruturas gráficas e conceituais salvas.
  - **Redações**: Histórico de textos submetidos aos exames com avaliação da IA.
  - **Cronogramas**: Planejamentos semanais gravados.

### ✍️ 2. Histórico Completo e Leitor de Redações na Íntegras
- **Persistência do Texto Integral:** Atualizado o modelo de armazenamento para gravar o texto completo (`essayText`) enviado pelo aluno junto do parecer pedagógico.
- **Visualizador Modal de Redação:** Tela dedicada ao clicar em qualquer redação no histórico para exibir:
  - Proposta/tema escolhido, modelo do exame (ENEM, FUVEST, UNICAMP, UERJ, ITA) e data de envio.
  - **Texto integral da redação** formatado em cartão estilo folha de resposta com contagem de palavras e caracteres.
  - Relatório de correção detalhado: nota total, barras por competência, pontos fortes, oportunidades de melhoria, reescritas sugeridas e parecer geral da banca.

### 🏷️ 3. Atualização de Versão
- Atualizado o indicador de versão em todo o sistema, menus e rodapés para **v0.6**.

---

## 🚀 [v0.5] - Atualização SDK Gemini 2.5 Flash, Simulados Direcionados & IA Didática

### ⚡ 1. Nova SDK Oficial @google/genai & Resiliência na API
- **SDK Oficial `@google/genai`**: Transição completa e estrita para a nova SDK oficial utilizando o modelo `gemini-2.5-flash`.
- **Conexão Resiliente e Retentativas**: Mecanismo automatizado de retentativas (exponential backoff), controle de timeouts e fallback direto via REST HTTP para garantir 100% de disponibilidade nas rotas de backend.
- **Parse Seguro de JSON**: Tratamento com limpeza de markdown, regex fallback e tratamento de caracteres especiais para evitar falhas no parsing de respostas.

### 🎯 2. Gerador de Simulados Avançado & Robusto
- **Direcionamento do Conteúdo**: Adicionado seletor com dois níveis de direcionamento antes da geração do simulado:
  - *Básico:* Nome do tópico/assunto geral.
  - *Aprofundado / Roteiro:* Inclusão de um roteiro detalhado de tópicos específicos a serem cobrados nas questões.
- **Questões com 5 Alternativas & Gabarito Comentado**:
  - Questões elaboradas no estilo ENEM/vestibulares com enunciados completos e bem contextualizados.
  - 5 alternativas plausíveis (A, B, C, D, E) com distratores pedagógicos por questão.
  - Gabarito comentado passo a passo pela IA explicando por que a alternativa está correta e a fundamentação teórica.

### 💡 3. Resumos Profundos & Mapas Mentais Multinível
- **Resumos Didáticos em Markdown**: Introdução detalhada com destaques em negrito, tópicos estruturados, vocabulário e termos-chave essenciais, exemplos práticos da rotina do aluno e dicas de prova.
- **Mapas Mentais Multinível Encadeados**: Estrutura multinível em 3 camadas visuais (Conceito Central $\rightarrow$ Eixos Principais $\rightarrow$ Definições, Fórmulas & Exemplos), com visualização gráfica clara.
- **Linguagem Pedagógica e Didática**: Respostas de IA otimizadas para o público da Educação Básica e estudantes pré-vestibulandos.

### 🏷️ 4. Indicadores de Versão v0.5
- Atualização do indicador de versão no canto inferior da tela inicial (Sidebar), rodapés e modais para **v0.5**.

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
