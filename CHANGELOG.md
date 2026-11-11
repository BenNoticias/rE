# 📋 Log de Atualizações (Changelog) - Estuda AI

Todas as alterações notáveis, melhorias, novos recursos e correções no sistema **Estuda AI** estão documentadas neste arquivo.

---

## 🚀 [v0.7] - Refatoração Completa, Separação de Abas, Supabase Auth Google & Bug Fix Gemini

### 🔐 1. Configuração Segura da API do Gemini e .gitignore
- **Proteção Absoluta de Credenciais**:
  - Armazenamento de chaves exclusivamente em arquivos de ambiente (`.env.local` / `.env`).
  - `.gitignore` atualizado na raiz e no subdiretório do projeto com regras estritas para garantir que nenhum `.env*` seja commitado publicamente.
  - Documentação clara em `.env.example` para implantação em produção na Vercel.
- **Bug Fix Crítico de IA em Produção**:
  - Corrigido o erro que causava falha silenciosa em todas as chamadas de IA (o modelo anterior `'gemini-3.6-flash'` não existia na API do Google).
  - Implementado cliente resiliente com fallback inteligente entre modelos oficiais (`gemini-1.5-flash`, `gemini-2.0-flash` e `gemini-1.5-pro`).
  - Adicionado `responseMimeType: 'application/json'` e algoritmo avançado de extração e `safeParseJson` com sanitização de blocos markdown.
  - Simulados, mapas mentais, resumos e correções de redação agora funcionam perfeitamente na Vercel via Server Routes.

### 🔑 2. Autenticação via Google com Supabase (Vercel)
- **Integração Supabase Auth**:
  - Implementada a função `signInWithOAuth` com provedor Google e seleção de contas (`prompt: 'select_account'`).
  - Configurado o Route Handler de callback em `/auth/callback` com `exchangeCodeForSession` para troca do código por sessão.
  - URLs de redirecionamento dinâmicas calculando automaticamente o domínio da Vercel (`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_VERCEL_URL` / `window.location.origin`).
  - Sincronização automática do perfil do estudante no banco de dados do Supabase (`profiles`) em tempo real.

### ✍️ 3. Separação das Abas: Redação e Vestibulares
- **Aba Independente "Redação" (`RedacaoModule.tsx`)**:
  - Focada exclusivamente na escrita, envio e correção de dissertações por IA.
  - Seleção de modelo oficial de exame (ENEM com 5 competências, FUVEST, UNICAMP, UERJ e ITA).
  - Acervo temático com propostas e textos motivadores atualizados, além de suporte a tema personalizado.
  - Editor dedicado com contagem de palavras, parágrafos, estimativa de linhas e cronômetro de redação (60 min).
  - Relatório de correção pedagógica nota por nota com gráficos de competências, pontos fortes, oportunidades de melhoria, sugestões práticas de reescrita e histórico de redações salvas.
- **Aba Independente "Vestibulares" (`VestibularesModule.tsx`)**:
  - Seção dedicada exclusivamente à consulta de bancas, estatísticas de provas e resolução de questões anteriores.
  - Navegação entre: "Banco de Questões", "Modo Simulado Cronometrado" e "Estatísticas & Análise de Bancas".

### 📚 4. Banco de Questões Oficiais de Vestibulares com Comentários
- **Acervo Estruturado**:
  - Questões autênticas dos maiores exames: **ENEM**, **FUVEST (USP)**, **UNICAMP**, **UERJ** e **ITA**.
  - Categorização em 4 níveis: **Banca**, **Ano**, **Matéria** e **Assunto** (ex: Proporcionalidade, Fotossíntese, Era Vargas, Termodinâmica, pH).
  - Gabarito oficial detalhado com resolução comentada passo a passo para cada questão.
  - Script SQL de criação de tabelas, RLS e seed para o Supabase (`src/lib/supabase-schema.sql`).
  - Conexão e sincronização dinâmica com a tabela `past_exam_questions` do Supabase com fallback seguro para o acervo local.

### 🏷️ 5. Atualização de Versão
- Versão oficial do projeto atualizada para **v0.7** no indicador do menu lateral, tela de login, modais e tipos do sistema.

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
