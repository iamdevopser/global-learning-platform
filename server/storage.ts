import { 
  users, 
  categories, 
  courses, 
  courseSections, 
  lessons, 
  enrollments, 
  lessonProgress, 
  reviews,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Course,
  type InsertCourse,
  type CourseSection,
  type InsertCourseSection,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type LessonProgress,
  type InsertLessonProgress,
  type Review,
  type InsertReview,
  type CourseWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Course methods
  getCourses(params?: { categoryId?: number; search?: string; teacherId?: number; published?: boolean }): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  getCourseWithRelations(id: number): Promise<CourseWithRelations | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  // Course Section methods
  getCourseSections(courseId: number): Promise<CourseSection[]>;
  createCourseSection(section: InsertCourseSection): Promise<CourseSection>;
  updateCourseSection(id: number, section: Partial<InsertCourseSection>): Promise<CourseSection>;
  deleteCourseSection(id: number): Promise<void>;

  // Lesson methods
  getLessons(sectionId: number): Promise<Lesson[]>;
  getLessonById(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: number): Promise<void>;

  // Enrollment methods
  getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]>;
  getCourseEnrollments(courseId: number): Promise<(Enrollment & { user: User })[]>;
  enrollUser(userId: number, courseId: number): Promise<Enrollment>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<Enrollment>;

  // Lesson Progress methods
  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;

  // Review methods
  getCourseReviews(courseId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Course methods
  async getCourses(params?: { categoryId?: number; search?: string; teacherId?: number; published?: boolean }): Promise<Course[]> {
    let query = db.select().from(courses);

    const conditions = [];
    if (params?.categoryId) {
      conditions.push(eq(courses.categoryId, params.categoryId));
    }
    if (params?.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${params.search}%`),
          ilike(courses.description, `%${params.search}%`)
        )
      );
    }
    if (params?.teacherId) {
      conditions.push(eq(courses.teacherId, params.teacherId));
    }
    if (params?.published !== undefined) {
      conditions.push(eq(courses.published, params.published));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(courses.createdAt));
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getCourseWithRelations(id: number): Promise<CourseWithRelations | undefined> {
    const course = await this.getCourseById(id);
    if (!course) return undefined;

    const [category, teacher, courseSectionsData, reviewsData] = await Promise.all([
      course.categoryId ? this.getCategoryById(course.categoryId) : null,
      this.getUser(course.teacherId),
      db.select().from(courseSections).where(eq(courseSections.courseId, id)).orderBy(asc(courseSections.order)),
      db.select({
        review: reviews,
        user: users
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.courseId, id))
      .orderBy(desc(reviews.createdAt))
    ]);

    const sectionsWithLessons = await Promise.all(
      courseSectionsData.map(async (section) => {
        const lessonsData = await db.select()
          .from(lessons)
          .where(eq(lessons.sectionId, section.id))
          .orderBy(asc(lessons.order));
        
        return {
          ...section,
          lessons: lessonsData
        };
      })
    );

    return {
      ...course,
      category: category || undefined,
      teacher: teacher!,
      sections: sectionsWithLessons,
      reviews: reviewsData.map(({ review, user }) => ({ ...review, user }))
    };
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Course Section methods
  async getCourseSections(courseId: number): Promise<CourseSection[]> {
    return await db.select()
      .from(courseSections)
      .where(eq(courseSections.courseId, courseId))
      .orderBy(asc(courseSections.order));
  }

  async createCourseSection(section: InsertCourseSection): Promise<CourseSection> {
    const [newSection] = await db
      .insert(courseSections)
      .values(section)
      .returning();
    return newSection;
  }

  async updateCourseSection(id: number, section: Partial<InsertCourseSection>): Promise<CourseSection> {
    const [updatedSection] = await db
      .update(courseSections)
      .set(section)
      .where(eq(courseSections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteCourseSection(id: number): Promise<void> {
    await db.delete(courseSections).where(eq(courseSections.id, id));
  }

  // Lesson methods
  async getLessons(sectionId: number): Promise<Lesson[]> {
    return await db.select()
      .from(lessons)
      .where(eq(lessons.sectionId, sectionId))
      .orderBy(asc(lessons.order));
  }

  async getLessonById(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db
      .insert(lessons)
      .values(lesson)
      .returning();
    return newLesson;
  }

  async updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set(lesson)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: number): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Enrollment methods
  async getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]> {
    const result = await db.select({
      enrollment: enrollments,
      course: courses
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.enrolledAt));

    return result.map(({ enrollment, course }) => ({ ...enrollment, course }));
  }

  async getCourseEnrollments(courseId: number): Promise<(Enrollment & { user: User })[]> {
    const result = await db.select({
      enrollment: enrollments,
      user: users
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.courseId, courseId))
    .orderBy(desc(enrollments.enrolledAt));

    return result.map(({ enrollment, user }) => ({ ...enrollment, user }));
  }

  async enrollUser(userId: number, courseId: number): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId, courseId })
      .returning();
    return enrollment;
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    return enrollment || undefined;
  }

  async updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<Enrollment> {
    const [enrollment] = await db
      .update(enrollments)
      .set({ 
        progress: progress.toString(),
        lastAccessedAt: new Date(),
        ...(progress >= 100 && { completedAt: new Date() })
      })
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ))
      .returning();
    return enrollment;
  }

  // Lesson Progress methods
  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const [progress] = await db.select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      ));
    return progress || undefined;
  }

  async updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(progress.userId, progress.lessonId);
    
    if (existing) {
      const [updated] = await db
        .update(lessonProgress)
        .set({
          ...progress,
          ...(progress.completed && { completedAt: new Date() })
        })
        .where(and(
          eq(lessonProgress.userId, progress.userId),
          eq(lessonProgress.lessonId, progress.lessonId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(lessonProgress)
        .values({
          ...progress,
          ...(progress.completed && { completedAt: new Date() })
        })
        .returning();
      return newProgress;
    }
  }

  // Review methods
  async getCourseReviews(courseId: number): Promise<(Review & { user: User })[]> {
    const result = await db.select({
      review: reviews,
      user: users
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.courseId, courseId))
    .orderBy(desc(reviews.createdAt));

    return result.map(({ review, user }) => ({ ...review, user }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update course rating and review count
    const courseReviews = await this.getCourseReviews(review.courseId);
    const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
    
    await db
      .update(courses)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: courseReviews.length,
        updatedAt: new Date()
      })
      .where(eq(courses.id, review.courseId));

    return newReview;
  }
}

export const storage = new DatabaseStorage();
