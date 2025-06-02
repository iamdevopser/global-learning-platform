import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { CourseWithRelations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Play, Clock, Users, Star, BookOpen, CheckCircle, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: course, isLoading } = useQuery<CourseWithRelations>({
    queryKey: [`/api/courses/${id}`],
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  const isEnrolled = enrollments.some((e: any) => e.courseId === parseInt(id!));

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/enrollments", { courseId: parseInt(id!) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Enrolled Successfully!",
        description: "You can now access this course.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-64 rounded-xl mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="w-full h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const totalDuration = course.sections.reduce((acc, section) => 
    acc + section.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration || 0), 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Video/Image */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-6">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white" />
                </div>
              )}
              
              {course.videoUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white bg-opacity-90 text-primary hover:bg-opacity-100"
                    disabled={!isEnrolled && !user}
                    asChild={isEnrolled}
                  >
                    {isEnrolled ? (
                      <Link href={`/learn/${course.id}`}>
                        <Play className="w-6 h-6 mr-2" />
                        Continue Learning
                      </Link>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Preview Course
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {course.category && (
                  <Badge variant="secondary">{course.category.name}</Badge>
                )}
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {course.teacher.firstName} {course.teacher.lastName}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-amber-500" />
                  {course.rating} ({course.reviewCount} reviews)
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrollmentCount} students
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* Course Content */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              <div className="space-y-4">
                {course.sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardContent className="p-0">
                      <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-semibold text-lg">{section.title}</h3>
                        {section.description && (
                          <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          {section.lessons.length} lessons • {section.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)} minutes
                        </p>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {lesson.isFree || isEnrolled ? (
                                  <Play className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <span className="text-xs font-medium text-gray-600">
                                    {sectionIndex + 1}.{lessonIndex + 1}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {lesson.isFree && <Badge variant="outline" className="text-xs">Free</Badge>}
                              <span>{lesson.duration} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
              {course.reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
              ) : (
                <div className="space-y-6">
                  {course.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={review.user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {review.user.firstName} {review.user.lastName}
                                </h4>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? "text-amber-500 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && <p className="text-gray-700">{review.comment}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">${course.price}</div>
                  <p className="text-gray-600">One-time purchase</p>
                </div>

                {user ? (
                  isEnrolled ? (
                    <div className="space-y-4">
                      <Button asChild className="w-full" size="lg">
                        <Link href={`/learn/${course.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Link>
                      </Button>
                      <div className="flex items-center justify-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">You're enrolled in this course</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => enrollMutation.mutate()}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )
                ) : (
                  <Button asChild className="w-full" size="lg">
                    <Link href="/auth">Sign in to Enroll</Link>
                  </Button>
                )}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{Math.floor(totalDuration / 60)} hours of video content</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3 text-gray-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Instructor Info */}
                <div>
                  <h3 className="font-semibold mb-4">Instructor</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={course.teacher.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {course.teacher.firstName?.[0]}{course.teacher.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {course.teacher.firstName} {course.teacher.lastName}
                      </div>
                      <div className="text-sm text-gray-600">Course Instructor</div>
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
