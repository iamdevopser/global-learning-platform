import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Trophy, Target, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: user?.role === 'student',
  });

  const { data: featuredCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses/featured'],
  });

  const { data: studentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/analytics/student'],
    enabled: user?.role === 'student',
  });

  const currentCourses = enrollments?.filter(e => !e.completed).slice(0, 3) || [];
  const completedCourses = enrollments?.filter(e => e.completed) || [];

  const stats = user?.role === 'student' && studentStats ? [
    {
      title: "Courses Completed",
      value: studentStats.coursesCompleted,
      icon: <Trophy className="h-4 w-4" />,
      color: 'success' as const,
    },
    {
      title: "In Progress",
      value: studentStats.coursesInProgress,
      icon: <BookOpen className="h-4 w-4" />,
      color: 'primary' as const,
    },
    {
      title: "Total Hours",
      value: studentStats.totalHours,
      icon: <Clock className="h-4 w-4" />,
      color: 'warning' as const,
    },
    {
      title: "Certificates",
      value: studentStats.certificates,
      icon: <Target className="h-4 w-4" />,
      color: 'success' as const,
    },
  ] : [];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName || 'Learner'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {user.role === 'student' 
                ? "Continue your learning journey and achieve your goals."
                : "Manage your courses and connect with students worldwide."
              }
            </p>
            
            {user.role === 'student' && (
              <div className="mt-6 flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{completedCourses.length}</div>
                  <div className="text-sm text-blue-200">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentCourses.length}</div>
                  <div className="text-sm text-blue-200">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-sm text-blue-200">Day Streak</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats for Students */}
        {user.role === 'student' && (
          <div className="mb-8">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <DashboardStats stats={stats} />
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning (for students) */}
            {user.role === 'student' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Continue Learning</h2>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : currentCourses.length > 0 ? (
                  <div className="grid gap-6">
                    {currentCourses.map((enrollment) => (
                      <CourseCard
                        key={enrollment.id}
                        course={{
                          ...enrollment.course!,
                          teacher: { firstName: "Instructor" },
                        }}
                        showProgress
                        progress={enrollment.progress}
                        onContinue={() => {
                          // Handle continue learning
                          window.location.href = `/courses/${enrollment.course!.id}`;
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No courses in progress
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Start learning something new today!
                      </p>
                      <Link href="/courses">
                        <Button>Browse Courses</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Featured Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.role === 'student' ? 'Recommended for You' : 'Featured Courses'}
                </h2>
                <Link href="/courses">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {coursesLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-80" />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredCourses?.slice(0, 4).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        ...course,
                        teacher: { firstName: "Expert", lastName: "Instructor" },
                        enrollmentCount: 156,
                        avgRating: 4.8,
                      }}
                      onEnroll={() => {
                        // Handle enrollment
                        window.location.href = `/courses/${course.id}`;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  {user.role === 'student' 
                    ? "Navigate your learning journey" 
                    : "Manage your teaching activities"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'student' ? (
                  <>
                    <Link href="/courses" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Button>
                    </Link>
                    <Link href="/mentorship" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Find Mentor
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Trophy className="mr-2 h-4 w-4" />
                        View Progress
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/teacher/dashboard" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Courses
                      </Button>
                    </Link>
                    <Link href="/teacher/create" className="block">
                      <Button className="w-full justify-start">
                        <Target className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Learning Streak (for students) */}
            {user.role === 'student' && (
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Learning Streak</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">7 days</div>
                    <p className="text-green-100 text-sm">
                      Keep it up! You're doing great.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {user.role === 'student' ? 'Mentorship Session' : 'Student Meeting'}
                      </p>
                      <p className="text-xs text-slate-600">Today, 3:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Live Workshop</p>
                      <p className="text-xs text-slate-600">Tomorrow, 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Course Completed</p>
                      <p className="text-xs text-slate-600">JavaScript Basics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">5-Star Review</p>
                      <p className="text-xs text-slate-600">React Course</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
