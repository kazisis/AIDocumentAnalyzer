import { tasks, content, apiKeys, type Task, type InsertTask, type Content, type InsertContent, users, type User, type InsertUser, type ApiKey } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  
  createContent(content: InsertContent): Promise<Content>;
  getContentByTaskId(taskId: number): Promise<Content[]>;
  getContentByTaskIdAndType(taskId: number, type: string): Promise<Content | undefined>;
  updateContent(id: number, updates: Partial<Content>): Promise<Content | undefined>;
  approveContent(id: number, content: string): Promise<Content | undefined>;

  // API Key management
  getApiKeys(): Promise<Array<{provider: string, hasKey: boolean, lastUpdated?: string}>>;
  getApiKey(provider: string): Promise<string | null>;
  saveApiKey(provider: string, apiKey: string): Promise<void>;
  deleteApiKey(provider: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const [contentItem] = await db
      .insert(content)
      .values(contentData)
      .returning();
    return contentItem;
  }

  async getContentByTaskId(taskId: number): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.taskId, taskId))
      .orderBy(desc(content.createdAt));
  }

  async getContentByTaskIdAndType(taskId: number, type: string): Promise<Content | undefined> {
    const [contentItem] = await db
      .select()
      .from(content)
      .where(and(eq(content.taskId, taskId), eq(content.type, type)));
    return contentItem || undefined;
  }

  async updateContent(id: number, updates: Partial<Content>): Promise<Content | undefined> {
    const [contentItem] = await db
      .update(content)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return contentItem || undefined;
  }

  async approveContent(id: number, contentText: string): Promise<Content | undefined> {
    const [contentItem] = await db
      .update(content)
      .set({ content: contentText, isApproved: true, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return contentItem || undefined;
  }

  // API Key management methods
  private encryptApiKey(apiKey: string): string {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptApiKey(encryptedApiKey: string): string {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
    const [ivHex, encrypted] = encryptedApiKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, secretKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async getApiKeys(): Promise<Array<{provider: string, hasKey: boolean, lastUpdated?: string}>> {
    const keys = await db.select().from(apiKeys);
    const providers = ['openai', 'anthropic', 'gemini', 'deepseek', 'grok'];
    
    return providers.map(provider => {
      const key = keys.find(k => k.provider === provider);
      return {
        provider,
        hasKey: !!key,
        lastUpdated: key?.updatedAt.toISOString()
      };
    });
  }

  async getApiKey(provider: string): Promise<string | null> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.provider, provider));
    if (!key) return null;
    
    try {
      return this.decryptApiKey(key.encryptedKey);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }

  async saveApiKey(provider: string, apiKey: string): Promise<void> {
    const encryptedKey = this.encryptApiKey(apiKey);
    const now = new Date();
    
    // Use upsert pattern - try to update first, then insert if not exists
    const existing = await db.select().from(apiKeys).where(eq(apiKeys.provider, provider));
    
    if (existing.length > 0) {
      await db
        .update(apiKeys)
        .set({ encryptedKey, updatedAt: now })
        .where(eq(apiKeys.provider, provider));
    } else {
      await db
        .insert(apiKeys)
        .values({ provider, encryptedKey, createdAt: now, updatedAt: now });
    }
  }

  async deleteApiKey(provider: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.provider, provider));
  }
}

export const storage = new DatabaseStorage();
