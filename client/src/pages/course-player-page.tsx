import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CourseWithRelations } from "@shared/schema";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  CheckCircle,
  Clock,
  BookOpen
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());

  const { data: course, isLoading } = useQuery<CourseWithRelations>({
    queryKey: [`/api/courses/${id}`],
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  const enrollment = enrollments.find((e: any) => e.courseId === parseInt(id!));

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; completed: boolean; watchTime: number }) => {
      return await apiRequest("POST", "/api/lesson-progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="grid lg:grid-cols-3 gap-8 h-screen">
          <div className="lg:col-span-2">
            <Skeleton className="w-full h-64" />
            <div className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="bg-white border-l">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        </div>
      </div>
    );
  }

  // Flatten all lessons for easy navigation
  const allLessons = course.sections.flatMap(section => 
    section.lessons.map(lesson => ({ ...lesson, sectionTitle: section.title }))
  );

  const currentLesson = currentLessonId 
    ? allLessons.find(lesson => lesson.id === currentLessonId)
    : allLessons[0];

  const currentLessonIndex = allLessons.findIndex(lesson => lesson.id === currentLesson?.id);
  const nextLesson = allLessons[currentLessonIndex + 1];
  const prevLesson = allLessons[currentLessonIndex - 1];

  const toggleSection = (sectionId: number) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const handleLessonComplete = (lessonId: number, watchTime: number) => {
    updateProgressMutation.mutate({
      lessonId,
      completed: true,
      watchTime,
    });
  };

  const totalLessons = allLessons.length;
  const completedLessons = 0; // This would come from lesson progress data
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid lg:grid-cols-3 gap-0 h-screen">
        {/* Video Player Area */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Video Player */}
          <div className="bg-black aspect-video">
            {currentLesson?.videoUrl ? (
              <VideoPlayer
                videoUrl={currentLesson.videoUrl}
                onComplete={(watchTime) => handleLessonComplete(currentLesson.id, watchTime)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p>No video available for this lesson</p>
                </div>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="flex-1 bg-white p-6 overflow-y-auto">
            <div className="max-w-4xl">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                  disabled={!prevLesson}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="text-sm text-gray-600">
                  {currentLessonIndex + 1} of {totalLessons}
                </div>
                <Button
                  variant="outline"
                  onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                  disabled={!nextLesson}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Lesson Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{currentLesson?.sectionTitle}</Badge>
                  <Badge variant="outline">Lesson {currentLessonIndex + 1}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson?.title}</h1>
                {currentLesson?.description && (
                  <p className="text-gray-700">{currentLesson.description}</p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Course Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">About this course</h2>
                <p className="text-gray-700">{course.description}</p>
              </div>

              {/* Resources */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Resources</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Course Materials
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Sidebar */}
        <div className="bg-white border-l border-gray-200 flex flex-col">
          {/* Progress Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold mb-4">{course.title}</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-sm text-gray-600">
                {completedLessons} of {totalLessons} lessons completed
              </div>
            </div>
          </div>

          {/* Course Content List */}
          <div className="flex-1 overflow-y-auto">
            {course.sections.map((section) => (
              <div key={section.id} className="border-b border-gray-100">
                <button
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => toggleSection(section.id)}
                >
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-gray-600">
                      {section.lessons.length} lessons
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transform transition-transform ${
                      openSections.has(section.id) ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {openSections.has(section.id) && (
                  <div className="bg-gray-50">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        className={`w-full p-3 pl-8 text-left text-sm hover:bg-gray-100 flex items-center justify-between border-b border-gray-200 last:border-b-0 ${
                          currentLesson?.id === lesson.id ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => setCurrentLessonId(lesson.id)}
                      >
                        <div className="flex items-center space-x-3">
                          {/* This would check if lesson is completed */}
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600 hidden" />
                          </div>
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{lesson.duration}m</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
