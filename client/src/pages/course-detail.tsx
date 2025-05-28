import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  Globe, 
  Smartphone, 
  IdCard, 
  RefreshCw,
  Heart,
  Share,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['/api/courses', courseId],
    queryFn: () => api.getCourse(courseId),
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course!",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Already enrolled')) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enrollment Failed",
          description: "Failed to enroll in course. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Course Not Found
              </h3>
              <p className="text-slate-600 mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <Card className="overflow-hidden">
              <img
                src={course.thumbnailUrl || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                alt={course.title}
                className="w-full h-64 object-cover"
              />
              
              <CardHeader className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="ml-2 text-slate-600">4.8 (1,247 reviews)</span>
                  </div>
                </div>
                
                <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-xl text-slate-600 mb-6">
                  {course.description}
                </CardDescription>
                
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {Math.round((course.duration || 0) / 60)} hours
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    1,247 students
                  </span>
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    English
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Course Content
                </CardTitle>
                <CardDescription>
                  {course.lessons?.length || 0} lessons • {Math.round((course.duration || 0) / 60)} hours total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <Accordion type="single" collapsible>
                    {course.lessons.map((lesson, index) => (
                      <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="font-medium text-slate-900">{lesson.title}</h3>
                              <p className="text-sm text-slate-500">
                                {Math.round((lesson.duration || 0) / 60)} min
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-11">
                            <p className="text-slate-600 mb-4">
                              {lesson.description || "Learn the fundamentals and advanced concepts in this comprehensive lesson."}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Play className="h-4 w-4 text-primary" />
                              <span className="text-sm text-slate-600">Video lesson</span>
                              <span className="text-sm text-slate-500">•</span>
                              <span className="text-sm text-slate-500">
                                {Math.round((lesson.duration || 0) / 60)} minutes
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Course content coming soon
                    </h3>
                    <p className="text-slate-600">
                      The instructor is preparing the lessons for this course.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Your Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                      alt="David Rodriguez"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">DR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">David Rodriguez</h3>
                    <p className="text-slate-600 mb-4">Senior Software Engineer at Tech Corp</p>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      David has 8+ years of experience in full-stack development and has mentored over 10,000 students. 
                      He specializes in modern web technologies and has worked with companies like Google and Microsoft.
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        15,247 students
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        4.9 instructor rating
                      </span>
                      <span className="flex items-center">
                        <Play className="h-4 w-4 mr-2" />
                        12 courses
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Student Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.reviews && course.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {course.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.studentId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-slate-900">Student</span>
                              <div className="flex text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700">
                              {review.comment || "Great course! Highly recommended."}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-slate-600">
                      Be the first to review this course!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-slate-900">
                    {formatPrice(course.price)}
                  </div>
                  {parseFloat(course.price) > 0 && (
                    <>
                      <div className="text-sm text-slate-500 line-through">$199</div>
                      <div className="text-sm text-red-600 font-medium">55% off</div>
                    </>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      if (parseFloat(course.price) > 0) {
                        window.location.href = `/checkout?courseId=${course.id}`;
                      } else {
                        enrollMutation.mutate();
                      }
                    }}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      "Enrolling..."
                    ) : parseFloat(course.price) > 0 ? (
                      "Enroll Now"
                    ) : (
                      "Enroll for Free"
                    )}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    <span>Access on mobile and TV</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IdCard className="h-5 w-5 text-green-500" />
                    <span>IdCard of completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-5 w-5 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-green-500" />
                    <span>Downloadable resources</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card>
              <CardHeader>
                <CardTitle>This course includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Play className="h-4 w-4 text-slate-400" />
                    <span>{Math.round((course.duration || 0) / 60)} hours on-demand video</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4 text-slate-400" />
                    <span>12 downloadable resources</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-slate-400" />
                    <span>Source code included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IdCard className="h-4 w-4 text-slate-400" />
                    <span>8 coding exercises</span>
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
