# 📚 Estuda AI - Plataforma Inteligente de Estudos (v0.4)

O **Estuda AI** é uma plataforma educacional moderna e 100% gratuita que utiliza inteligência artificial (Google Gemini) para auxiliar estudantes nos ensinos Fundamental, Médio e Pré-Vestibular com simulados, provas anteriores, correção de redações, mapas mentais, flashcards, cronogramas e resumos inteligentes.

---

## ✨ Funcionalidades (v0.4)

- 🎓 **Vestibulares & Correção de Redação**: Acervo de provas anteriores (ENEM, FUVEST, UNICAMP, UERJ) com gabarito comentado e correção automatizada de redação via Gemini AI baseada em competências oficiais.
- 🔔 **Central de Notificações Dinâmicas**: Alertas em tempo real para cronograma de estudos, avisos de ranking, simulados concluídos e resultado de redações.
- 🧠 **Simulados & Questões**: Geração dinâmica de simulados com níveis de dificuldade, explicações detalhadas e cronômetro.
- 🗺️ **Mapas Mentais Interativos**: Visualização conceitual baseada em nós conectados (`@xyflow/react`).
- 📅 **Cronograma de Estudos & Pomodoro**: Planejamento personalizado com temporizador de foco.
- 🏆 **Ranking & Gamificação**: Tiers de progresso (Bronze a Lenda), estatísticas de ofensiva (*streaks*) e classificações de XP.
- 🔐 **Segurança & Conformidade LGPD**: Autenticação via Supabase, exportação de dados e transparência.
- 🌓 **Modo Escuro / Claro**: Interface intuitiva com suporte a temas.

---

## 📋 Log de Atualizações

Para verificar a lista completa de novidades, atualizações de segurança, novos componentes e melhorias da versão v0.4, consulte o [CHANGELOG.md](./CHANGELOG.md).

---

## 🚀 Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **React 18** & **TypeScript**
- **Tailwind CSS**
- **Google Generative AI SDK** (Gemini)
- **Supabase** (Autenticação e Banco de Dados)
- **Lucide React** (Ícones modernos)

---

## 🛠️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/BenNoticias/rE.git
cd rE
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com suas credenciais:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini_aqui
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
