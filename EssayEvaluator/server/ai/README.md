# Sistema de IA para Correção e Geração de Redações

Este sistema implementa agentes especializados usando o OpenAI Agents SDK para automatizar a correção e geração de redações escolares.

## 🚀 Funcionalidades Implementadas

### 1. Correção Automatizada de Redações

- **Agente Especializado**: Corretor com persona de professor experiente
- **Critérios de Avaliação**:
  - Ortografia (0-25 pontos)
  - Gramática (0-25 pontos)
  - Coerência e Coesão (0-25 pontos)
  - Argumentação (0-25 pontos)
- **Saída Estruturada**: JSON com notas, comentários por critério e sugestões
- **Few-Shot Learning**: Exemplos de boas e más redações para treinamento

### 2. Geração de Redações Exemplares

- **Agente Especializado**: Gerador com conhecimento em diferentes gêneros textuais
- **Tipos Suportados**: Dissertativa, Narrativa, Descritiva, Expositiva
- **Níveis Educacionais**: Fundamental, Médio, Superior, ENEM
- **Personalização**: Tema, tipo, nível e número de palavras ajustáveis

## 🏗️ Arquitetura

```
server/ai/
├── prompts.ts        # Prompts few-shot para treinamento dos agentes
├── agents.ts         # Definição dos agentes e ferramentas
└── README.md         # Esta documentação
```

### Componentes Principais

#### 1. Prompts Few-Shot (`prompts.ts`)

- **ESSAY_CORRECTION_PROMPTS**: Sistema prompt + exemplos de correção
- **ESSAY_GENERATION_PROMPTS**: Sistema prompt + exemplos de geração
- Exemplos incluem redações de diferentes qualidades e níveis

#### 2. Agentes Especializados (`agents.ts`)

- **essayCorrectorAgent**: Agente para correção de redações
- **essayGeneratorAgent**: Agente para geração de redações
- Ferramentas customizadas com validação Zod

#### 3. Funções Principais

- **correctEssay()**: Processa correção via OpenAI API
- **generateEssay()**: Processa geração via OpenAI API
- Fallback para dados mock em caso de erro

## 🔧 Configuração

### 1. Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure sua chave da OpenAI
OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Dependências Instaladas

```bash
npm install @openai/agents zod
```

## 📋 Formato de Saída

### Correção de Redação

```json
{
  "finalScore": 8.4,
  "relevanceScore": 9.2,
  "grammarScore": 8.1,
  "structureScore": 8.7,
  "depthScore": 7.8,
  "corrections": "Análise detalhada com comentários por critério..."
}
```

### Geração de Redação

```json
{
  "title": "Título da Redação",
  "content": "Conteúdo completo da redação...",
  "wordCount": 387,
  "charCount": 2234,
  "readTime": "2 min"
}
```

## 🎯 Critérios de Avaliação

### Ortografia (0-25 pontos)

- Acentuação correta
- Grafia adequada
- Pontuação apropriada

### Gramática (0-25 pontos)

- Concordância verbal e nominal
- Regência verbal e nominal
- Colocação pronominal
- Tempos verbais

### Coerência e Coesão (0-25 pontos)

- Organização lógica das ideias
- Uso adequado de conectivos
- Progressão textual
- Articulação entre parágrafos

### Argumentação (0-25 pontos)

- Desenvolvimento de argumentos
- Fundamentação das ideias
- Exemplificação adequada
- Persuasão e consistência

## 🔄 Integração no Sistema

O sistema substitui as funções mock anteriores:

- `mockEvaluateEssay` → `evaluateEssayWithAI`
- `mockGenerateEssay` → `generateEssayWithAI`

### Endpoints Afetados

- `POST /api/essays/evaluate` - Usa correção com IA
- `POST /api/essays/generate` - Usa geração com IA

## 🛡️ Tratamento de Erros

- **Validação Zod**: Garante formato correto das respostas
- **Fallback Graceful**: Retorna para dados mock se IA falhar
- **Logs Detalhados**: Registra erros para debugging
- **Timeouts**: Evita travamentos em requests longos

## 🎓 Metodologia Few-Shot

### Exemplos de Treinamento

- **Redação Fraca** (Nota: 55/100): Estrutura básica, argumentação superficial
- **Redação Excelente** (Nota: 92/100): Estrutura avançada, argumentação sólida

### Benefícios

- **Consistência**: Avaliações padronizadas seguindo critérios pedagógicos
- **Qualidade**: Gerações seguem modelos de redações exemplares
- **Adaptabilidade**: Ajusta-se a diferentes níveis educacionais
- **Pedagogia**: Fornece feedback detalhado e construtivo

## 🚀 Próximos Passos

1. **Monitoring**: Implementar métricas de qualidade das avaliações
2. **Cache**: Armazenar resultados para otimizar performance
3. **Personalização**: Adaptar critérios por instituição de ensino
4. **Expansão**: Adicionar mais tipos de texto (carta, relatório, etc.)

## 📊 Exemplo de Uso

```typescript
// Correção de redação
const resultado = await correctEssay(
  "Conteúdo da redação...",
  "Tema: Sustentabilidade ambiental"
);

// Geração de redação
const redacao = await generateEssay(
  "A importância da leitura",
  "dissertativa",
  "medio",
  500
);
```

---

**Implementado com OpenAI Agents SDK** - Sistema inteligente para educação brasileira
