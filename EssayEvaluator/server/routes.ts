import { insertDocumentSchema, insertMaterialSchema } from "@shared/schema";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { correctEssay, generateEssay } from "./ai/agents.js";
import { storage } from "./storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to ensure user is authenticated
const getAuthenticatedUser = (
  req: Request
): { userId: number; username: string } => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
};

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Authentication failed: No token provided");
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log("Authentication failed:", err.message);
      console.log("Token:", token.substring(0, 20) + "...");
      console.log("JWT_SECRET:", JWT_SECRET.substring(0, 10) + "...");
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    console.log("Authentication successful for user:", user.username);
    req.user = user;
    next();
  });
};

// AI essay evaluation function using OpenAI Agents
const evaluateEssayWithAI = async (content: string, theme?: string) => {
  try {
    return await correctEssay(content, theme);
  } catch (error) {
    console.error("AI evaluation failed, falling back to mock:", error);
    // Fallback para avaliação mock em caso de erro
    return {
      finalScore: 7.5,
      relevanceScore: 8.0,
      grammarScore: 7.2,
      structureScore: 7.8,
      depthScore: 7.0,
      corrections:
        "Sistema de avaliação temporariamente indisponível. Esta é uma avaliação de exemplo para fins de demonstração.",
    };
  }
};

// AI essay generation function using OpenAI Agents
const generateEssayWithAI = async (
  theme: string,
  type: string,
  level: string,
  wordCount: number
) => {
  try {
    return await generateEssay(
      theme,
      type as "dissertativa" | "narrativa" | "descritiva" | "expositiva",
      level as "fundamental" | "medio" | "superior" | "enem",
      wordCount
    );
  } catch (error) {
    console.error("AI generation failed, falling back to mock:", error);
    // Fallback para geração mock em caso de erro
    return {
      title: `Redação sobre ${theme}`,
      content: `Esta é uma redação exemplar sobre ${theme.toLowerCase()}, demonstrando os principais aspectos que devem ser abordados em uma redação ${type} de nível ${level}.\n\nEm primeiro lugar, é importante estabelecer uma introdução clara que apresente o tema de forma contextualizada. O desenvolvimento deve explorar diferentes perspectivas e argumentos relevantes ao assunto proposto.\n\nAlém disso, a conclusão deve retomar os pontos principais e apresentar uma reflexão final sobre o tema, mantendo coerência com todo o desenvolvimento anterior.\n\nPortanto, uma redação bem estruturada deve apresentar organização lógica, argumentação consistente e linguagem adequada ao público-alvo e contexto educacional especificado.`,
      wordCount: Math.floor(wordCount * 0.9),
      charCount: Math.floor(wordCount * 5.5),
      readTime: `${Math.ceil(wordCount / 200)} min`,
    };
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For demo purposes, we'll use simple password comparison
      // In production, use bcrypt.compare(password, user.password)
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/api/auth/me",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const authUser = getAuthenticatedUser(req);
        const user = await storage.getUser(authUser.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        });
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Essay evaluation routes
  app.post(
    "/api/essays/evaluate",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const authUser = getAuthenticatedUser(req);
        const { content, theme } = req.body;

        if (!content || content.trim().length < 200) {
          return res
            .status(400)
            .json({ message: "Essay content must be at least 200 characters" });
        }

        // Create essay record
        const essay = await storage.createEssay({
          userId: authUser.userId,
          content,
          theme: theme || null,
        });

        // Evaluate essay using AI agents
        const evaluation = await evaluateEssayWithAI(content, theme);

        // Save evaluation
        const savedEvaluation = await storage.createEvaluation({
          essayId: essay.id,
          userId: authUser.userId,
          finalScore: evaluation.finalScore.toString(),
          relevanceScore: evaluation.relevanceScore.toString(),
          grammarScore: evaluation.grammarScore.toString(),
          structureScore: evaluation.structureScore.toString(),
          depthScore: evaluation.depthScore.toString(),
          corrections: evaluation.corrections,
        });

        res.json({
          essayId: essay.id,
          evaluationId: savedEvaluation.id,
          ...evaluation,
        });
      } catch (error) {
        console.error("Essay evaluation error:", error);
        res.status(500).json({ message: "Error evaluating essay" });
      }
    }
  );

  // Essay generation routes
  app.post(
    "/api/essays/generate",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const {
          theme,
          type = "dissertativa",
          level = "medio",
          wordCount = 500,
        } = req.body;

        if (!theme || theme.trim().length === 0) {
          return res.status(400).json({ message: "Theme is required" });
        }

        // Generate essay using AI agents
        const generated = await generateEssayWithAI(
          theme,
          type,
          level,
          wordCount
        );

        // Save generated essay
        const savedEssay = await storage.createGeneratedEssay({
          userId: getAuthenticatedUser(req).userId,
          theme,
          type,
          level,
          wordCount,
          content: generated.content,
        });

        res.json({
          id: savedEssay.id,
          ...generated,
        });
      } catch (error) {
        console.error("Essay generation error:", error);
        res.status(500).json({ message: "Error generating essay" });
      }
    }
  );

  app.get(
    "/api/essays/generated",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const essays = await storage.getGeneratedEssaysByUser(
          getAuthenticatedUser(req).userId
        );
        res.json(essays);
      } catch (error) {
        res.status(500).json({ message: "Error fetching generated essays" });
      }
    }
  );

  // Materials routes
  app.get(
    "/api/materials",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const materials = await storage.getMaterialsByUser(
          getAuthenticatedUser(req).userId
        );
        res.json(materials);
      } catch (error) {
        res.status(500).json({ message: "Error fetching materials" });
      }
    }
  );

  app.post(
    "/api/materials",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const validatedData = insertMaterialSchema.parse({
          ...req.body,
          userId: getAuthenticatedUser(req).userId,
        });

        const material = await storage.createMaterial(validatedData);
        res.status(201).json(material);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid data", errors: error.errors });
        }
        res.status(500).json({ message: "Error creating material" });
      }
    }
  );

  app.put(
    "/api/materials/:id",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const material = await storage.updateMaterial(id, req.body);

        if (!material) {
          return res.status(404).json({ message: "Material not found" });
        }

        res.json(material);
      } catch (error) {
        res.status(500).json({ message: "Error updating material" });
      }
    }
  );

  app.delete(
    "/api/materials/:id",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const deleted = await storage.deleteMaterial(id);

        if (!deleted) {
          return res.status(404).json({ message: "Material not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: "Error deleting material" });
      }
    }
  );

  // Chat routes
  app.get(
    "/api/chat/messages",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const messages = await storage.getChatMessagesByUser(
          getAuthenticatedUser(req).userId
        );
        res.json(messages);
      } catch (error) {
        res.status(500).json({ message: "Error fetching chat messages" });
      }
    }
  );

  app.post(
    "/api/chat/messages",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const { content } = req.body;

        // Save user message
        const userMessage = await storage.createChatMessage({
          userId: getAuthenticatedUser(req).userId,
          role: "user",
          content,
        });

        // Generate AI response (mock for now)
        const aiResponse =
          "Baseado nos documentos fornecidos, posso sugerir atividades que integram conceitos de ciências e matemática para o 9º ano. Gostaria que eu elaborasse um plano de aula interdisciplinar?";

        const assistantMessage = await storage.createChatMessage({
          userId: getAuthenticatedUser(req).userId,
          role: "assistant",
          content: aiResponse,
        });

        res.json([userMessage, assistantMessage]);
      } catch (error) {
        res.status(500).json({ message: "Error sending message" });
      }
    }
  );

  // Documents routes
  app.get(
    "/api/documents",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const documents = await storage.getDocumentsByUser(
          getAuthenticatedUser(req).userId
        );
        res.json(documents);
      } catch (error) {
        res.status(500).json({ message: "Error fetching documents" });
      }
    }
  );

  app.post(
    "/api/documents",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const validatedData = insertDocumentSchema.parse({
          ...req.body,
          userId: getAuthenticatedUser(req).userId,
        });

        const document = await storage.createDocument(validatedData);
        res.status(201).json(document);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid data", errors: error.errors });
        }
        res.status(500).json({ message: "Error uploading document" });
      }
    }
  );

  app.delete(
    "/api/documents/:id",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const deleted = await storage.deleteDocument(id);

        if (!deleted) {
          return res.status(404).json({ message: "Document not found" });
        }

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: "Error deleting document" });
      }
    }
  );

  // Dashboard stats routes
  app.get(
    "/api/dashboard/stats",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const evaluations = await storage.getEvaluationsByUser(
          getAuthenticatedUser(req).userId
        );
        const materials = await storage.getMaterialsByUser(
          getAuthenticatedUser(req).userId
        );
        const generatedEssays = await storage.getGeneratedEssaysByUser(
          getAuthenticatedUser(req).userId
        );

        const stats = {
          essaysEvaluated: evaluations.length,
          materialsCreated: materials.length,
          timeSaved: Math.floor(
            evaluations.length * 2.5 + materials.length * 1.5
          ),
          averageScore:
            evaluations.length > 0
              ? (
                  evaluations.reduce(
                    (sum, evaluation) =>
                      sum + parseFloat(evaluation.finalScore),
                    0
                  ) / evaluations.length
                ).toFixed(1)
              : "0.0",
        };

        res.json(stats);
      } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats" });
      }
    }
  );

  app.get(
    "/api/dashboard/recent-activities",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const evaluations = await storage.getEvaluationsByUser(
          getAuthenticatedUser(req).userId
        );
        const generatedEssays = await storage.getGeneratedEssaysByUser(
          getAuthenticatedUser(req).userId
        );
        const materials = await storage.getMaterialsByUser(
          getAuthenticatedUser(req).userId
        );

        const activities = [
          ...evaluations.slice(-5).map((evaluation) => ({
            id: evaluation.id,
            type: "evaluation",
            title: `Redação avaliada - Nota: ${evaluation.finalScore}`,
            time: evaluation.createdAt,
            icon: "file-alt",
          })),
          ...generatedEssays.slice(-5).map((essay) => ({
            id: essay.id,
            type: "generation",
            title: `Redação exemplar gerada: "${essay.theme}"`,
            time: essay.createdAt,
            icon: "magic",
          })),
          ...materials.slice(-5).map((material) => ({
            id: material.id,
            type: "material",
            title: `Material criado: ${material.title}`,
            time: material.createdAt,
            icon: "folder",
          })),
        ]
          .sort(
            (a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime()
          )
          .slice(0, 10);

        res.json(activities);
      } catch (error) {
        res.status(500).json({ message: "Error fetching recent activities" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
