import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import {
  EDUCATIONAL_CHAT_PROMPTS,
  ESSAY_CORRECTION_PROMPTS,
  ESSAY_GENERATION_PROMPTS,
} from "./prompts.js";

// Schema para validação da correção de redação
const EssayCorrectionSchema = z.object({
  notaGeral: z.number().min(0).max(100),
  notaOrtografia: z.number().min(0).max(25),
  notaGramatica: z.number().min(0).max(25),
  notaCoerenciaCoesao: z.number().min(0).max(25),
  notaArgumentacao: z.number().min(0).max(25),
  comentarios: z.object({
    ortografia: z.string(),
    gramatica: z.string(),
    coerenciaCoesao: z.string(),
    argumentacao: z.string(),
  }),
  sugestoesMelhoria: z.array(z.string()),
  aspectosPositivos: z.array(z.string()),
});

// Schema para validação da geração de redação
const EssayGenerationSchema = z.object({
  titulo: z.string(),
  conteudo: z.string(),
  contadorPalavras: z.number(),
  contadorCaracteres: z.number(),
  tempoLeitura: z.string(),
});

// Ferramenta para correção de redações
const essayCorrectionTool = tool({
  name: "corrigir_redacao",
  description:
    "Corrige e avalia uma redação seguindo critérios pedagógicos brasileiros",
  parameters: z.object({
    content: z.string().describe("Conteúdo da redação a ser corrigida"),
    theme: z.string().nullable().describe("Tema da redação (opcional)"),
  }),
  execute: async ({ content, theme }) => {
    try {
      // Simula o processamento da correção
      // Na implementação real, esta função seria executada pelo agente de IA
      const wordCount = content.split(" ").length;

      if (wordCount < 50) {
        throw new Error("Redação muito curta para avaliação adequada");
      }

      // Retorna um resultado estruturado que será usado pelo agente
      return {
        content,
        theme: theme || "Tema não especificado",
        wordCount,
        processed: true,
      };
    } catch (error) {
      throw new Error(
        `Erro na correção: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  },
});

// Ferramenta para geração de redações
const essayGenerationTool = tool({
  name: "gerar_redacao",
  description: "Gera uma redação exemplar com base nos parâmetros fornecidos",
  parameters: z.object({
    theme: z.string().describe("Tema da redação"),
    type: z
      .enum(["dissertativa", "narrativa", "descritiva", "expositiva"])
      .describe("Tipo de redação"),
    level: z
      .enum(["fundamental", "medio", "superior", "enem"])
      .describe("Nível educacional"),
    wordCount: z
      .number()
      .min(100)
      .max(2000)
      .describe("Número aproximado de palavras"),
  }),
  execute: async ({ theme, type, level, wordCount }) => {
    try {
      // Simula o processamento da geração
      // Na implementação real, esta função seria executada pelo agente de IA
      if (!theme.trim()) {
        throw new Error("Tema não pode estar vazio");
      }

      return {
        theme,
        type,
        level,
        wordCount,
        processed: true,
      };
    } catch (error) {
      throw new Error(
        `Erro na geração: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  },
});

// Agente especializado em correção de redações
export const essayCorrectorAgent = new Agent({
  name: "Corretor de Redações",
  instructions: ESSAY_CORRECTION_PROMPTS.system,
  tools: [essayCorrectionTool],
  model: "gpt-4o",
});

// Agente especializado em geração de redações
export const essayGeneratorAgent = new Agent({
  name: "Gerador de Redações",
  instructions: ESSAY_GENERATION_PROMPTS.system,
  tools: [essayGenerationTool],
  model: "gpt-4o",
});

// Função para correção de redação usando o agente
export async function correctEssay(content: string, theme?: string) {
  try {
    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    console.log(
      "OpenAI API Key disponível:",
      process.env.OPENAI_API_KEY ? "Sim" : "Não"
    );
    console.log("API Key length:", process.env.OPENAI_API_KEY?.length || 0);

    // Adiciona exemplos few-shot ao contexto
    const prompt = `
${ESSAY_CORRECTION_PROMPTS.fewShotExamples
  .map(
    (example) =>
      `${example.role === "user" ? "Usuário" : "Assistente"}: ${
        example.content
      }`
  )
  .join("\n\n")}

Agora avalie esta redação:
Tema: ${theme || "Não especificado"}
Conteúdo: ${content}

Responda APENAS com o JSON no formato especificado nas instruções.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: ESSAY_CORRECTION_PROMPTS.system },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", response.status, errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    // Tenta extrair o JSON da resposta
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }

    const correctionResult = JSON.parse(jsonMatch[0]);

    // Valida o resultado usando Zod
    const validated = EssayCorrectionSchema.parse(correctionResult);

    return {
      finalScore: validated.notaGeral / 10, // Converte para escala 0-10
      relevanceScore: validated.notaArgumentacao / 2.5, // Converte para escala 0-10
      grammarScore: validated.notaGramatica / 2.5,
      structureScore: validated.notaCoerenciaCoesao / 2.5,
      depthScore: validated.notaArgumentacao / 2.5,
      corrections: [
        `**Ortografia (${validated.notaOrtografia}/25):** ${validated.comentarios.ortografia}`,
        `**Gramática (${validated.notaGramatica}/25):** ${validated.comentarios.gramatica}`,
        `**Coerência e Coesão (${validated.notaCoerenciaCoesao}/25):** ${validated.comentarios.coerenciaCoesao}`,
        `**Argumentação (${validated.notaArgumentacao}/25):** ${validated.comentarios.argumentacao}`,
        "",
        "**Sugestões de Melhoria:**",
        ...validated.sugestoesMelhoria.map((s) => `• ${s}`),
        "",
        "**Aspectos Positivos:**",
        ...validated.aspectosPositivos.map((a) => `• ${a}`),
      ].join("\n\n"),
    };
  } catch (error) {
    console.error("Erro na correção de redação:", error);
    throw new Error(
      `Falha na correção: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

// Função para geração de redação usando o agente
export async function generateEssay(
  theme: string,
  type:
    | "dissertativa"
    | "narrativa"
    | "descritiva"
    | "expositiva" = "dissertativa",
  level: "fundamental" | "medio" | "superior" | "enem" = "medio",
  wordCount: number = 500
) {
  try {
    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    // Adiciona exemplos few-shot ao contexto
    const prompt = `
${ESSAY_GENERATION_PROMPTS.fewShotExamples
  .map(
    (example) =>
      `${example.role === "user" ? "Usuário" : "Assistente"}: ${
        example.content
      }`
  )
  .join("\n\n")}

Agora gere uma redação com os seguintes parâmetros:
- Tema: ${theme}
- Tipo: ${type}
- Nível: ${level}
- Palavras aproximadas: ${wordCount}

Responda APENAS com o JSON no formato especificado nas instruções.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: ESSAY_GENERATION_PROMPTS.system },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "OpenAI API Error (Generation):",
        response.status,
        errorText
      );
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    // Tenta extrair o JSON da resposta
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }

    const generationResult = JSON.parse(jsonMatch[0]);

    // Valida o resultado usando Zod
    const validated = EssayGenerationSchema.parse(generationResult);

    return {
      title: validated.titulo,
      content: validated.conteudo,
      wordCount: validated.contadorPalavras,
      charCount: validated.contadorCaracteres,
      readTime: validated.tempoLeitura,
    };
  } catch (error) {
    console.error("Erro na geração de redação:", error);
    throw new Error(
      `Falha na geração: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

// Educational Chat Agent
export async function educationalChat(
  message: string
): Promise<{ content: string; isStructured: boolean }> {
  try {
    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    // Detecta se é uma solicitação de plano de aula ou atividade
    const isLessonPlan =
      /plano\s+de\s+aula|geração\s+de\s+aula|aula\s+sobre/i.test(message);
    const isActivity = /atividade|exercício|questões|prova|avaliação/i.test(
      message
    );

    let examples: Array<{ role: "user" | "assistant"; content: string }> = [];
    if (isLessonPlan) {
      examples = EDUCATIONAL_CHAT_PROMPTS.lessonPlanExamples;
    } else if (isActivity) {
      examples = EDUCATIONAL_CHAT_PROMPTS.activityExamples;
    }

    // Monta o prompt com exemplos quando relevante
    const userPrompt =
      examples.length > 0
        ? `${examples
            .map(
              (ex) =>
                `${ex.role === "user" ? "Usuário" : "Assistente"}: ${
                  ex.content
                }`
            )
            .join("\n\n")}\n\nUsuário: ${message}`
        : message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: EDUCATIONAL_CHAT_PROMPTS.system },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", response.status, errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    // Verifica se é uma resposta estruturada (JSON)
    const isStructured =
      rawContent.trim().startsWith("{") && rawContent.trim().endsWith("}");

    return {
      content: rawContent,
      isStructured,
    };
  } catch (error) {
    console.error("Erro no educationalChat:", error);

    // Fallback para respostas genéricas
    const fallbackResponses = {
      plano: `Como Professora Ana, posso ajudar você a criar um plano de aula estruturado! 

Para criar o melhor plano possível, me informe:
- Qual o tema da aula?
- Para qual ano/série?
- Qual disciplina?
- Quanto tempo disponível?

Com essas informações, criarei um plano completo com objetivos, metodologia, recursos e avaliação.`,

      atividade: `Fico feliz em ajudar na criação de atividades educacionais!

Para desenvolver a atividade ideal, preciso saber:
- Qual disciplina e ano/série?
- Que tipo de atividade (interpretação, questões objetivas, produção textual)?
- Qual o tema ou conteúdo?
- Nível de dificuldade desejado?

Criarei exercícios com gabarito e explicações detalhadas.`,

      geral: `Olá! Sou a Professora Ana, especialista em educação fundamental e média. 

Posso ajudar você com:
📚 Criação de planos de aula estruturados
✏️ Desenvolvimento de atividades e exercícios
🎯 Estratégias pedagógicas eficazes
📝 Métodos de avaliação
💡 Dicas para engajar os alunos

Como posso auxiliar hoje?`,
    };

    const isLessonPlan = /plano\s+de\s+aula|geração\s+de\s+aula/i.test(message);
    const isActivity = /atividade|exercício|questões/i.test(message);

    const fallbackContent = isLessonPlan
      ? fallbackResponses.plano
      : isActivity
      ? fallbackResponses.atividade
      : fallbackResponses.geral;

    return {
      content: fallbackContent,
      isStructured: false,
    };
  }
}
