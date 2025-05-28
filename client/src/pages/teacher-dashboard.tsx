import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import DashboardStats from "@/components/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Users, 
  DollarSign, 
  BookOpen, 
  BarChart3, 
  Star, 
  Clock, 
  TrendingUp,
  Edit,
  Eye,
  UserPlus,
  MessageSquare,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    level: 'beginner',
    categoryId: '',
  });

  const { data: teacherCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses', { teacherId: user?.id }],
    queryFn: () => api.getCourses({ teacherId: user?.id }),
    enabled: !!user?.id,
  });

  const { data: teacherStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/analytics/teacher'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => api.getCategories(),
  });

  const createCourseMutation = useMutation({
    mutationFn: (courseData: any) => api.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/teacher'] });
      setIsCreateModalOpen(false);
      setCourseForm({
        title: '',
        description: '',
        price: '',
        level: 'beginner',
        categoryId: '',
      });
      toast({
        title: "Course Created",
        description: "Your new course has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: (courseId: number) => api.updateCourse(courseId, { published: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Course Published",
        description: "Your course is now live and available to students.",
      });
    },
    onError: () => {
      toast({
        title: "Publish Failed",
        description: "Failed to publish course. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== 'teacher') {
    return null;
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseForm.title || !courseForm.description || !courseForm.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createCourseMutation.mutate({
      ...courseForm,
      price: parseFloat(courseForm.price).toString(),
      categoryId: courseForm.categoryId ? parseInt(courseForm.categoryId) : undefined,
    });
  };

  const stats = teacherStats ? [
    {
      title: "Total Students",
      value: teacherStats.totalStudents,
      change: 15,
      changeLabel: "from last month",
      icon: <Users className="h-4 w-4" />,
      color: 'primary' as const,
    },
    {
      title: "Active Courses",
      value: teacherStats.coursesCount,
      icon: <BookOpen className="h-4 w-4" />,
      color: 'success' as const,
    },
    {
      title: "Total Revenue",
      value: `$${teacherStats.totalRevenue}`,
      change: 23,
      changeLabel: "this month",
      icon: <DollarSign className="h-4 w-4" />,
      color: 'warning' as const,
    },
    {
      title: "Average Rating",
      value: teacherStats.avgRating.toFixed(1),
      icon: <Star className="h-4 w-4" />,
      color: 'success' as const,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Teacher Dashboard 👨‍🏫</h1>
            <p className="text-yellow-100 text-lg mb-6">
              Manage your courses and connect with students worldwide.
            </p>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{teacherCourses?.filter(c => c.published).length || 0}</div>
                <div className="text-sm text-yellow-200">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{teacherStats?.totalStudents || 0}</div>
                <div className="text-sm text-yellow-200">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${teacherStats?.totalRevenue || '0'}</div>
                <div className="text-sm text-yellow-200">Revenue</div>
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
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Plus className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-slate-900">Create Course</h3>
                  <p className="text-sm text-slate-500">Build new content</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new course for your students.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your course..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="99.99"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <Select value={courseForm.level} onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {categories && (
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={courseForm.categoryId} onValueChange={(value) => setCourseForm(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCourseMutation.isPending}>
                    {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-900">Analytics</h3>
              <p className="text-sm text-slate-500">Track performance</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-900">Students</h3>
              <p className="text-sm text-slate-500">Manage enrollments</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-slate-900">Payouts</h3>
              <p className="text-sm text-slate-500">View earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Published</Button>
                  <Button variant="outline" size="sm">Draft</Button>
                </div>
              </div>

              {coursesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : teacherCourses && teacherCourses.length > 0 ? (
                <div className="space-y-4">
                  {teacherCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <img
                              src={course.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80"}
                              alt={course.title}
                              className="w-20 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                                <Badge variant={course.published ? 'default' : 'secondary'}>
                                  {course.published ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">
                                {course.description.substring(0, 150)}...
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                                <span><Users className="h-4 w-4 inline mr-1" />0 students</span>
                                <span><Star className="h-4 w-4 inline mr-1 text-yellow-500" />0 rating</span>
                                <span><Clock className="h-4 w-4 inline mr-1" />{course.duration || 0} min</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-slate-900">${course.price}</span>
                                <span className="text-sm text-slate-500">•</span>
                                <span className="text-sm text-green-600 font-medium">$0 this month</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {!course.published && (
                              <Button 
                                size="sm"
                                onClick={() => publishCourseMutation.mutate(course.id)}
                                disabled={publishCourseMutation.isPending}
                              >
                                Publish
                              </Button>
                            )}
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
                      No courses yet
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Create your first course to start teaching!
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">New student enrolled</p>
                      <p className="text-xs text-slate-500">Emma Wilson joined "Web Development"</p>
                      <p className="text-xs text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">New 5-star review</p>
                      <p className="text-xs text-slate-500">"Excellent course content and structure!"</p>
                      <p className="text-xs text-slate-400">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">New course question</p>
                      <p className="text-xs text-slate-500">Student asked about React hooks</p>
                      <p className="text-xs text-slate-400">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Performance */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Revenue</span>
                    <span className="text-sm font-medium text-slate-900">
                      ${teacherStats?.totalRevenue || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">New Students</span>
                    <span className="text-sm font-medium text-slate-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Course Completions</span>
                    <span className="text-sm font-medium text-slate-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Avg. Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-slate-900">
                        {teacherStats?.avgRating.toFixed(1) || '0.0'}
                      </span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tip */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Pro Tip</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 text-sm">
                  Engage with your students by responding to questions within 24 hours. 
                  This increases course ratings by 40%!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
