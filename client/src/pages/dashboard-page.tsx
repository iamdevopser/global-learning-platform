import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Play,
  Calendar,
  Target
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const continueWatching = enrollments.filter((e: any) => 
    parseFloat(e.progress || "0") > 0 && parseFloat(e.progress || "0") < 100
  );

  const completedCourses = enrollments.filter((e: any) => 
    parseFloat(e.progress || "0") >= 100
  );

  const recentEnrollments = enrollments
    .sort((a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-lg text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 mb-2" />
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.enrolledCourses || 0}
                  </div>
                  <div className="text-sm text-gray-600">Enrolled Courses</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.completedCourses || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.inProgress || 0}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((stats?.totalHours || 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Continue Learning */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Continue Learning
                  {continueWatching.length > 0 && (
                    <Link href="/courses">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-2" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                        <Skeleton className="w-20 h-8" />
                      </div>
                    ))}
                  </div>
                ) : continueWatching.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No courses in progress</p>
                    <Link href="/courses">
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {continueWatching.map((enrollment: any) => (
                      <div key={enrollment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{enrollment.course.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Progress: {Math.round(parseFloat(enrollment.progress || "0"))}%
                          </p>
                          <Progress value={parseFloat(enrollment.progress || "0")} className="h-2" />
                        </div>
                        <Link href={`/learn/${enrollment.courseId}`}>
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Enrolled */}
            <Card>
              <CardHeader>
                <CardTitle>Recently Enrolled</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="w-12 h-12 mb-3" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : recentEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent enrollments</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentEnrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{enrollment.course.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {enrollment.course.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-orange-800">Monthly Goal</h3>
                      <span className="text-orange-600 text-2xl">🎯</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">Complete 2 courses this month</p>
                    <Progress value={50} className="h-2" />
                    <p className="text-xs text-orange-600 mt-1">1 of 2 completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                  {user?.role === "instructor" && (
                    <Link href="/instructor">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Instructor Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {completedCourses.length === 0 ? (
                  <p className="text-gray-600 text-sm">No achievements yet. Complete your first course to earn your first achievement!</p>
                ) : (
                  <div className="space-y-3">
                    {completedCourses.slice(0, 3).map((enrollment: any) => (
                      <div key={enrollment.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Course Completed</p>
                          <p className="text-xs text-gray-500">{enrollment.course.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
