# 📚 Estuda AI - Plataforma Inteligente de Estudos

O **Estuda AI** é uma plataforma educacional moderna e interativa que utiliza inteligência artificial (Google Gemini) para auxiliar estudantes nos ensinos Fundamental e Médio com simulados, mapas mentais, flashcards, cronogramas e resumos inteligentes.

---

## ✨ Funcionalidades

- 🧠 **Simulados & Questões**: Geração dinâmica de simulados com níveis de dificuldade, explicações detalhadas e cronômetro.
- 🗺️ **Mapas Mentais Interativos**: Visualização conceitual baseada em nós conectados (React Flow / @xyflow/react).
- 🗂️ **Flashcards & Repetição Espaçada**: Prática ágil com cartões interativos.
- 📅 **Cronograma de Estudos**: Planejamento personalizado de rotinas de estudo.
- 📝 **Resumos Inteligentes**: Sínteses didáticas adaptadas para Ensino Fundamental e Ensino Médio.
- 🌓 **Modo Escuro / Claro**: Interface intuitiva com suporte a temas.

---

## 🚀 Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **React 18** & **TypeScript**
- **Tailwind CSS**
- **Google Generative AI SDK** (Gemini)
- **@xyflow/react** (Mapas mentais interativos)
- **Lucide React** (Ícones modernos)
- **Canvas Confetti**

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
Crie um arquivo `.env.local` na raiz do projeto com sua chave da API do Gemini:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
