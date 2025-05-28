import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Trophy, Target, Calendar, Play, Star, TrendingUp, User } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
  });

  const { data: studentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/analytics/student'],
  });

  const { data: featuredCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses/featured'],
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: number; progress: number }) =>
      api.updateProgress(enrollmentId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/student'] });
      toast({
        title: "Progress Updated",
        description: "Your course progress has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return null;
  }

  const currentCourses = enrollments?.filter(e => !e.completed) || [];
  const completedCourses = enrollments?.filter(e => e.completed) || [];

  const stats = studentStats ? [
    {
      title: "Courses Completed",
      value: studentStats.coursesCompleted,
      change: 12,
      changeLabel: "from last month",
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
      change: 23,
      changeLabel: "this month",
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName || 'Student'}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Continue your learning journey and achieve your goals.
            </p>
            
            <div className="grid grid-cols-3 gap-8">
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
          </div>
        </div>

        {/* Stats */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-slate-900">Browse Courses</h3>
                <p className="text-sm text-slate-500">Discover new subjects</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/mentorship">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-slate-900">Find Mentor</h3>
                <p className="text-sm text-slate-500">Get personalized guidance</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-900">My Progress</h3>
              <p className="text-sm text-slate-500">Track your learning</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-900">Certificates</h3>
              <p className="text-sm text-slate-500">View achievements</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Continue Learning</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>

              {enrollmentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : currentCourses.length > 0 ? (
                <div className="space-y-4">
                  {currentCourses.map((enrollment) => (
                    <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={enrollment.course?.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80"}
                            alt={enrollment.course?.title}
                            className="w-20 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {enrollment.course?.title}
                            </h3>
                            <p className="text-sm text-slate-600 mb-3">
                              {enrollment.course?.description?.substring(0, 100)}...
                            </p>
                            <div className="flex items-center space-x-4 mb-3">
                              <span className="text-xs text-slate-500">Progress</span>
                              <div className="flex-1">
                                <Progress value={enrollment.progress} className="h-2" />
                              </div>
                              <span className="text-xs font-medium text-slate-700">
                                {enrollment.progress}%
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Link href={`/courses/${enrollment.course?.id}`}>
                                <Button size="sm">
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue Learning
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  const newProgress = Math.min(enrollment.progress + 10, 100);
                                  updateProgressMutation.mutate({
                                    enrollmentId: enrollment.id,
                                    progress: newProgress,
                                  });
                                }}
                                disabled={updateProgressMutation.isPending}
                              >
                                Mark Progress
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

            {/* Recommended Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                <Link href="/courses">
                  <Button variant="outline" size="sm">View All</Button>
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
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Mentorship Session</p>
                      <p className="text-xs text-slate-600">Today, 3:00 PM</p>
                      <p className="text-xs text-slate-500">with Dr. Smith</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Live Workshop</p>
                      <p className="text-xs text-slate-600">Tomorrow, 10:00 AM</p>
                      <p className="text-xs text-slate-500">React Best Practices</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Learning Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">7 days</div>
                  <p className="text-green-100 text-sm">Keep it up! You're doing great.</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
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
                      <Star className="h-4 w-4 text-green-600" />
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
