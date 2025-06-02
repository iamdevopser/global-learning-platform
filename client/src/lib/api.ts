import { apiRequest } from "@/lib/queryClient";

export interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  categoryId?: number;
  teacherId: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  level: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: number;
  studentId: string;
  courseId: number;
  progress: number;
  completed: boolean;
  enrolledAt: Date;
  course?: Course;
}

export interface MentorshipSession {
  id: number;
  mentorId: string;
  studentId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  price: string;
  status: string;
  meetingUrl?: string;
  createdAt: Date;
}

export const api = {
  // Auth
  getCurrentUser: (): Promise<User> =>
    apiRequest("GET", "/api/auth/user").then(res => res.json()),

  // Courses
  getCourses: (filters?: { categoryId?: number; teacherId?: string; published?: boolean }): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.published !== undefined) params.append('published', filters.published.toString());
    
    return apiRequest("GET", `/api/courses?${params}`).then(res => res.json());
  },

  getFeaturedCourses: (): Promise<Course[]> =>
    apiRequest("GET", "/api/courses/featured").then(res => res.json()),

  getCourse: (id: number): Promise<Course & { lessons: any[]; reviews: any[] }> =>
    apiRequest("GET", `/api/courses/${id}`).then(res => res.json()),

  createCourse: (courseData: Partial<Course>): Promise<Course> =>
    apiRequest("POST", "/api/courses", courseData).then(res => res.json()),

  updateCourse: (id: number, courseData: Partial<Course>): Promise<Course> =>
    apiRequest("PUT", `/api/courses/${id}`, courseData).then(res => res.json()),

  // Enrollments
  getEnrollments: (): Promise<Enrollment[]> =>
    apiRequest("GET", "/api/enrollments").then(res => res.json()),

  enrollInCourse: (courseId: number): Promise<Enrollment> =>
    apiRequest("POST", "/api/enrollments", { courseId }).then(res => res.json()),

  updateProgress: (enrollmentId: number, progress: number): Promise<Enrollment> =>
    apiRequest("PUT", `/api/enrollments/${enrollmentId}/progress`, { progress }).then(res => res.json()),

  // Reviews
  createReview: (courseId: number, rating: number, comment?: string): Promise<any> =>
    apiRequest("POST", `/api/courses/${courseId}/reviews`, { rating, comment }).then(res => res.json()),

  // Mentorship
  getMentorshipSessions: (): Promise<MentorshipSession[]> =>
    apiRequest("GET", "/api/mentorship/sessions").then(res => res.json()),

  createMentorshipSession: (sessionData: Partial<MentorshipSession>): Promise<MentorshipSession> =>
    apiRequest("POST", "/api/mentorship/sessions", sessionData).then(res => res.json()),

  // Categories
  getCategories: (): Promise<any[]> =>
    apiRequest("GET", "/api/categories").then(res => res.json()),

  // Analytics
  getTeacherStats: (): Promise<{
    totalStudents: number;
    totalRevenue: string;
    avgRating: number;
    coursesCount: number;
  }> =>
    apiRequest("GET", "/api/analytics/teacher").then(res => res.json()),

  getStudentStats: (): Promise<{
    coursesCompleted: number;
    coursesInProgress: number;
    totalHours: number;
    certificates: number;
  }> =>
    apiRequest("GET", "/api/analytics/student").then(res => res.json()),

  // Payments
  createPaymentIntent: (amount: number, courseId?: number, mentorshipSessionId?: number): Promise<{ clientSecret: string }> =>
    apiRequest("POST", "/api/create-payment-intent", { amount, courseId, mentorshipSessionId }).then(res => res.json()),
};
