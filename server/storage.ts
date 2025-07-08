import { tasks, content, type Task, type InsertTask, type Content, type InsertContent, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
