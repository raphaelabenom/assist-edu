# EduAssist: Mini SaaS para Assistência Educacional com IA

## Visão Geral

O EduAssist é um mini SaaS educacional que utiliza inteligência artificial para auxiliar professores na criação de materiais didáticos personalizados e na avaliação automatizada de atividades, reduzindo significativamente o tempo gasto em tarefas administrativas e permitindo maior foco no ensino.

## Dor Endereçada

A sobrecarga de trabalho administrativo dos professores é uma das principais dores do setor educacional brasileiro. Educadores gastam, em média, 30-40% de seu tempo em atividades como preparação de materiais, correção de avaliações e feedback individualizado, reduzindo o tempo disponível para interações pedagógicas de qualidade. Esta situação contribui para o esgotamento profissional, menor qualidade de ensino e, consequentemente, para o desengajamento dos alunos.

O EduAssist endereça diretamente esta dor ao automatizar tarefas repetitivas e de baixo valor pedagógico, permitindo que os professores concentrem seus esforços no que realmente importa: o desenvolvimento dos estudantes.

## Público-Alvo

O EduAssist é direcionado principalmente a:

- Professores do ensino fundamental e médio que buscam otimizar seu tempo e melhorar a qualidade de seus materiais didáticos
- Escolas e redes de ensino que desejam implementar soluções tecnológicas de baixo custo e alto impacto
- Tutores e educadores de reforço escolar que precisam personalizar conteúdos para diferentes alunos

## Impacto Social

O EduAssist tem potencial para transformar a educação brasileira ao:

- **Recuperar até 15 horas semanais** por professor, tempo que pode ser reinvestido em interações pedagógicas de qualidade
- **Democratizar o acesso** a materiais didáticos de alta qualidade, especialmente em escolas com recursos limitados
- **Reduzir a desigualdade educacional** ao permitir que professores dediquem mais atenção a alunos com dificuldades
- **Combater o burnout docente**, melhorando a satisfação profissional e a retenção de talentos na educação
- **Elevar a qualidade do ensino** sem depender de reformas estruturais complexas ou

## Funcionalidades Principais

### 1. Gerador de Materiais Didáticos

O EduAssist permite que professores criem rapidamente materiais didáticos personalizados a partir de tópicos curriculares. O professor insere o tema, nível de ensino e objetivos de aprendizagem, e a IA gera:

- Planos de aula estruturados
- Apresentações em formato editável
- Atividades práticas e exercícios com gabaritos
- Textos de apoio adaptados ao nível de leitura dos alunos

Todos os materiais gerados são editáveis e o professor mantém controle total sobre o conteúdo, podendo modificar, adaptar ou expandir conforme necessário.

### 2. Assistente de Avaliação

O módulo de avaliação permite que professores economizem tempo na correção de atividades e forneçam feedback mais rico aos estudantes:

- Correção automatizada de questões objetivas via upload de imagens das folhas de resposta
- Correção automatizada de redações
- Análise preliminar de respostas discursivas com sugestões de pontos a considerar na avaliação
- Geração de feedback personalizado para cada aluno com base em seu desempenho
- Identificação de padrões de erro comuns na turma, auxiliando no planejamento de revisões

### 3. Dashboard de Insights

Um painel simples e intuitivo que apresenta:

- Progresso da turma em diferentes habilidades e competências
- Identificação de estudantes que podem precisar de atenção adicional
- Sugestões de próximos tópicos a abordar com base nas lacunas identificadas
- Estatísticas de uso e economia de tempo proporcionada pela ferramenta

## Diferencial Tecnológico

O EduAssist se diferencia pela simplicidade e eficiência. Em vez de tentar resolver todos os problemas da educação, foca em aliviar uma dor específica e aguda dos educadores de forma prática e imediata.

A solução utiliza modelos de IA pré-treinados e APIs existentes (como OpenAI GPT ou alternativas open-source) para processamento de linguagem natural, combinados com algoritmos simples de análise de dados para gerar insights acionáveis. Esta abordagem permite implementação rápida e baixo custo operacional.

## Modelo de Negócio Simplificado

- **Freemium**: Versão básica gratuita com limite de usos mensais, versão premium com recursos avançados
- **Por Instituição**: Licenciamento para escolas e redes de ensino com preço por número de professores
- **Marketplace**: Possibilidade futura de marketplace para professores compartilharem materiais criados

## Impacto Social

O EduAssist tem potencial para:

- Reduzir em até 40% o tempo que professores gastam em tarefas administrativas
- Melhorar a qualidade dos materiais didáticos, especialmente em escolas com recursos limitados
- Permitir feedback mais frequente e personalizado aos estudantes
- Contribuir para a redução do burnout docente e melhoria da satisfação profissional

## Próximos Passos para o MVP

1. Desenvolver protótipo funcional do gerador de materiais didáticos
2. Testar com grupo pequeno de professores (5-10) para validação e feedback
3. Implementar melhorias baseadas no feedback inicial
4. Adicionar funcionalidade de assistente de avaliação
5. Desenvolver dashboard básico de insights
6. Preparar demonstração para o hackathon

O EduAssist representa uma solução prática, viável e de alto impacto que pode ser implementada rapidamente como MVP para demonstração em um hackathon, com potencial real de evolução para um produto completo que transforme positivamente o dia a dia dos educadores brasileiros.

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)
- **Git** (para clonar o repositório)

### Passo a Passo

#### 1. Clone o Repositório

```bash
git clone https://github.com/raphaelabenom/assist-edu.git
cd assist-edu/EssayEvaluator
```

#### 2. Instale as Dependências

```bash
npm install
```

#### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis:

```plaintext
# OpenAI API Configuration (obrigatório para IA)
OPENAI_API_KEY=sua-chave-openai-aqui

# JWT Secret para autenticação
JWT_SECRET=sua-chave-secreta-jwt-aqui

# Configuração do banco de dados (opcional)
DATABASE_URL=sua-url-do-banco-aqui

# Configuração da aplicação
NODE_ENV=development
PORT=5000
```

**⚠️ Importante:** Para obter uma chave da API OpenAI:

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma conta ou faça login
3. Vá em "API Keys" e gere uma nova chave
4. Cole a chave no arquivo `.env`

#### 4. Execute o Projeto

Para desenvolvimento (com hot reload):

```bash
npm run dev
```

Para produção:

```bash
npm run build
npm start
```

#### 5. Acesse a Aplicação

Abra seu navegador e acesse:

```
http://localhost:5000
```

### Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Gera build de produção
- `npm start` - Executa a versão de produção
- `npm run check` - Verifica tipos TypeScript
- `npm run db:push` - Atualiza schema do banco de dados

### Estrutura do Projeto

```
EssayEvaluator/
├── client/           # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   └── hooks/        # Custom hooks
├── server/           # Backend Express + TypeScript
│   ├── ai/              # Sistema de IA para correção
│   ├── routes.ts        # Rotas da API
│   └── storage.ts       # Camada de dados
└── shared/           # Schemas compartilhados
```

### Funcionalidades Disponíveis

#### 🎓 Login de Demonstração

Use as seguintes credenciais para testar:

- **Professor:** `professor` / `123456`
- **Administrador:** `admin` / `admin123`

#### 📝 Recursos Principais

1. **Geração de Materiais Didáticos** - Ainda não implementado

   - Acesse "Materiais" no menu lateral
   - Insira tema, nível e tipo de material
   - A IA gera conteúdo personalizado

2. **Correção de Redações**

   - Acesse "Avaliação de Redações"
   - Cole o texto da redação
   - Receba correção automática com notas e feedback

3. **Chat Educacional**

   - Acesse "Chat" para tirar dúvidas pedagógicas
   - Receba sugestões de atividades e materiais

### Solução de Problemas

#### Erro de API Key

Se você receber erros relacionados à API OpenAI:

1. Verifique se a chave está correta no arquivo `.env`
2. Certifique-se de que tem créditos na conta OpenAI
3. O sistema possui fallback para dados mock em caso de erro

#### Problemas de Dependências

```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

#### Problemas de Porta

Se a porta 5000 estiver ocupada, altere no arquivo `server/index.ts`:

```typescript
const port = 3000; // ou outra porta disponível
```

### 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a seção de troubleshooting acima
2. Consulte os logs no console do navegador (F12)
