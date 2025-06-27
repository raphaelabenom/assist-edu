import { 
  users, essays, evaluations, materials, generatedEssays, chatMessages, documents,
  type User, type InsertUser, type Essay, type InsertEssay, 
  type Evaluation, type InsertEvaluation, type Material, type InsertMaterial,
  type GeneratedEssay, type InsertGeneratedEssay, type ChatMessage, type InsertChatMessage,
  type Document, type InsertDocument
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Essays
  getEssay(id: number): Promise<Essay | undefined>;
  getEssaysByUser(userId: number): Promise<Essay[]>;
  createEssay(essay: InsertEssay): Promise<Essay>;
  
  // Evaluations
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getEvaluationsByUser(userId: number): Promise<Evaluation[]>;
  getEvaluationByEssay(essayId: number): Promise<Evaluation | undefined>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  
  // Materials
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialsByUser(userId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  
  // Generated Essays
  getGeneratedEssay(id: number): Promise<GeneratedEssay | undefined>;
  getGeneratedEssaysByUser(userId: number): Promise<GeneratedEssay[]>;
  createGeneratedEssay(essay: InsertGeneratedEssay): Promise<GeneratedEssay>;
  
  // Chat Messages
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Documents
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private essays: Map<number, Essay>;
  private evaluations: Map<number, Evaluation>;
  private materials: Map<number, Material>;
  private generatedEssays: Map<number, GeneratedEssay>;
  private chatMessages: Map<number, ChatMessage>;
  private documents: Map<number, Document>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.essays = new Map();
    this.evaluations = new Map();
    this.materials = new Map();
    this.generatedEssays = new Map();
    this.chatMessages = new Map();
    this.documents = new Map();
    this.currentId = 1;
    
    // Create default user
    this.createUser({
      username: "professor",
      password: "123456",
      name: "Prof. Maria Silva",
      role: "teacher"
    });
  }

  private getNextId(): number {
    return this.currentId++;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getNextId();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "teacher",
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Essays
  async getEssay(id: number): Promise<Essay | undefined> {
    return this.essays.get(id);
  }

  async getEssaysByUser(userId: number): Promise<Essay[]> {
    return Array.from(this.essays.values()).filter(essay => essay.userId === userId);
  }

  async createEssay(insertEssay: InsertEssay): Promise<Essay> {
    const id = this.getNextId();
    const essay: Essay = {
      ...insertEssay,
      theme: insertEssay.theme || null,
      id,
      createdAt: new Date()
    };
    this.essays.set(id, essay);
    return essay;
  }

  // Evaluations
  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    return this.evaluations.get(id);
  }

  async getEvaluationsByUser(userId: number): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values()).filter(evaluation => evaluation.userId === userId);
  }

  async getEvaluationByEssay(essayId: number): Promise<Evaluation | undefined> {
    return Array.from(this.evaluations.values()).find(evaluation => evaluation.essayId === essayId);
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.getNextId();
    const evaluation: Evaluation = {
      ...insertEvaluation,
      id,
      createdAt: new Date()
    };
    this.evaluations.set(id, evaluation);
    return evaluation;
  }

  // Materials
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterialsByUser(userId: number): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(material => material.userId === userId);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.getNextId();
    const material: Material = {
      ...insertMaterial,
      content: insertMaterial.content || null,
      id,
      createdAt: new Date()
    };
    this.materials.set(id, material);
    return material;
  }

  async updateMaterial(id: number, updateData: Partial<InsertMaterial>): Promise<Material | undefined> {
    const material = this.materials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial = { ...material, ...updateData };
    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Generated Essays
  async getGeneratedEssay(id: number): Promise<GeneratedEssay | undefined> {
    return this.generatedEssays.get(id);
  }

  async getGeneratedEssaysByUser(userId: number): Promise<GeneratedEssay[]> {
    return Array.from(this.generatedEssays.values()).filter(essay => essay.userId === userId);
  }

  async createGeneratedEssay(insertEssay: InsertGeneratedEssay): Promise<GeneratedEssay> {
    const id = this.getNextId();
    const essay: GeneratedEssay = {
      ...insertEssay,
      type: insertEssay.type || "dissertativa",
      level: insertEssay.level || "medio",
      wordCount: insertEssay.wordCount || 500,
      id,
      createdAt: new Date()
    };
    this.generatedEssays.set(id, essay);
    return essay;
  }

  // Chat Messages
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.getNextId();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Documents
  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.getNextId();
    const document: Document = {
      ...insertDocument,
      content: insertDocument.content || null,
      id,
      createdAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
