import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("teacher"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const essays = pgTable("essays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  theme: text("theme"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  essayId: integer("essay_id").references(() => essays.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  finalScore: decimal("final_score", { precision: 3, scale: 1 }).notNull(),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 1 }).notNull(),
  grammarScore: decimal("grammar_score", { precision: 3, scale: 1 }).notNull(),
  structureScore: decimal("structure_score", { precision: 3, scale: 1 }).notNull(),
  depthScore: decimal("depth_score", { precision: 3, scale: 1 }).notNull(),
  corrections: text("corrections").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'plan', 'presentation', 'exercise', 'assessment'
  subject: text("subject").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedEssays = pgTable("generated_essays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  theme: text("theme").notNull(),
  type: text("type").notNull().default("dissertativa"),
  level: text("level").notNull().default("medio"),
  wordCount: integer("word_count").notNull().default(500),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  createdAt: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedEssaySchema = createInsertSchema(generatedEssays).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Essay = typeof essays.$inferSelect;
export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type GeneratedEssay = typeof generatedEssays.$inferSelect;
export type InsertGeneratedEssay = z.infer<typeof insertGeneratedEssaySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
