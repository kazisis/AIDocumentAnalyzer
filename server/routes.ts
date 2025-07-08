import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskStatusSchema, approveContentSchema } from "@shared/schema";
import { generateKoreanBlog, generateDerivativeContent } from "./llm-providers";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task creation and management
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      
      // For now, use a default user ID of 1
      // In a real app, this would come from authentication
      const task = await storage.createTask({ ...validatedData, userId: 1 });
      
      // Start AI processing in background
      processTaskAsync(task.id, validatedData);
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid task data" 
      });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      // For now, use a default user ID of 1
      const tasks = await storage.getTasksByUserId(1);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch tasks" 
      });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch task" 
      });
    }
  });

  app.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      const { status } = updateTaskStatusSchema.parse(req.body);
      const task = await storage.updateTaskStatus(parseInt(req.params.id), status);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid status update" 
      });
    }
  });

  // Content management
  app.get("/api/tasks/:id/content", async (req, res) => {
    try {
      const content = await storage.getContentByTaskId(parseInt(req.params.id));
      res.json(content);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch content" 
      });
    }
  });

  app.patch("/api/content/:id/approve", async (req, res) => {
    try {
      const { content: contentText } = approveContentSchema.parse(req.body);
      const content = await storage.approveContent(parseInt(req.params.id), contentText);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Generate derivative content after approval
      if (content.type === 'korean_blog') {
        generateDerivativeContentAsync(content.taskId, {
          title: content.title || '',
          content: content.content
        });
      }

      res.json(content);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to approve content" 
      });
    }
  });

  app.patch("/api/content/:id", async (req, res) => {
    try {
      const updates = req.body;
      const content = await storage.updateContent(parseInt(req.params.id), updates);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to update content" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing functions
async function processTaskAsync(taskId: number, taskData: any) {
  try {
    // Update task status to processing
    await storage.updateTaskStatus(taskId, "processing");

    // Generate Korean blog content
    const blogContent = await generateKoreanBlog({
      topic: taskData.topic,
      sourceUrl: taskData.sourceUrl,
      sourceFile: taskData.sourceFile,
      sourceText: taskData.sourceText,
      comparison: taskData.comparison,
      requirements: taskData.requirements
    });

    // Save Korean blog content
    await storage.createContent({
      taskId,
      type: 'korean_blog',
      title: blogContent.title,
      content: blogContent.content,
      isApproved: false
    });

    // Update task status to review pending
    await storage.updateTaskStatus(taskId, "review_pending");

  } catch (error) {
    console.error('Task processing failed:', error);
    await storage.updateTaskStatus(taskId, "error");
  }
}

async function generateDerivativeContentAsync(taskId: number, koreanBlog: { title: string; content: string }) {
  try {
    const derivativeContent = await generateDerivativeContent(koreanBlog);

    // Save English blog
    await storage.createContent({
      taskId,
      type: 'english_blog',
      title: derivativeContent.englishBlog.title,
      content: derivativeContent.englishBlog.content,
      isApproved: false
    });

    // Save Threads content
    await storage.createContent({
      taskId,
      type: 'threads',
      title: 'Threads Posts',
      content: JSON.stringify(derivativeContent.threads),
      isApproved: false
    });

    // Save Twitter content
    await storage.createContent({
      taskId,
      type: 'twitter',
      title: 'Twitter Posts',
      content: JSON.stringify(derivativeContent.tweets),
      isApproved: false
    });

    // Update task status to approved (ready for distribution)
    await storage.updateTaskStatus(taskId, "approved");

  } catch (error) {
    console.error('Derivative content generation failed:', error);
  }
}
