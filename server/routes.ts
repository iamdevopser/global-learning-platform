import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertCategorySchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(403);
    }

    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const { categoryId, search, teacherId, published } = req.query;
      
      const params: any = {};
      if (categoryId) params.categoryId = parseInt(categoryId as string);
      if (search) params.search = search as string;
      if (teacherId) params.teacherId = parseInt(teacherId as string);
      if (published !== undefined) params.published = published === 'true';

      const courses = await storage.getCourses(params);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourseWithRelations(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated() || !["instructor", "admin"].includes(req.user?.role || "")) {
      return res.sendStatus(403);
    }

    try {
      const data = insertCourseSchema.parse({
        ...req.body,
        teacherId: req.user!.id
      });
      const course = await storage.createCourse(data);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourseById(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.teacherId !== req.user!.id && req.user?.role !== "admin") {
        return res.sendStatus(403);
      }

      const data = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await storage.updateCourse(id, data);
      res.json(updatedCourse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourseById(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.teacherId !== req.user!.id && req.user?.role !== "admin") {
        return res.sendStatus(403);
      }

      await storage.deleteCourse(id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enrollments
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const enrollments = await storage.getUserEnrollments(req.user!.id);
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { courseId } = req.body;
      const userId = req.user!.id;

      // Check if already enrolled
      const existing = await storage.getEnrollment(userId, courseId);
      if (existing) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.enrollUser(userId, courseId);
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Lesson Progress
  app.post("/api/lesson-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const data = {
        userId: req.user!.id,
        lessonId: req.body.lessonId,
        completed: req.body.completed || false,
        watchTime: req.body.watchTime || 0
      };

      const progress = await storage.updateLessonProgress(data);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reviews
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const reviews = await storage.getCourseReviews(courseId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const courseId = parseInt(req.params.id);
      const data = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
        courseId
      });

      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = req.user!;
      let stats = {};

      if (user.role === "instructor") {
        const courses = await storage.getCourses({ teacherId: user.id });
        const totalStudents = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
        const totalRevenue = courses.reduce((sum, course) => sum + parseFloat(course.price || "0"), 0);

        stats = {
          totalCourses: courses.length,
          totalStudents,
          totalRevenue,
          avgRating: courses.length > 0 
            ? courses.reduce((sum, course) => sum + parseFloat(course.rating || "0"), 0) / courses.length 
            : 0
        };
      } else {
        const enrollments = await storage.getUserEnrollments(user.id);
        const completedCourses = enrollments.filter(e => parseFloat(e.progress || "0") >= 100).length;

        stats = {
          enrolledCourses: enrollments.length,
          completedCourses,
          inProgress: enrollments.length - completedCourses,
          totalHours: enrollments.reduce((sum, e) => sum + (e.course.duration || 0), 0)
        };
      }

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
