import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { insertCourseSchema, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2,
  ArrowLeft,
  Save,
  Eye
} from "lucide-react";
import { z } from "zod";

type CourseFormData = z.infer<typeof insertCourseSchema>;

export default function CreateCoursePage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      price: "0",
      level: "beginner",
      published: false,
      thumbnailUrl: "",
      videoUrl: "",
      duration: 0,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return await res.json();
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course Created!",
        description: "Your course has been created successfully.",
      });
      setLocation(`/courses/${course.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    // Convert price to string and ensure numeric values are properly formatted
    const formattedData = {
      ...data,
      price: data.price.toString(),
      duration: data.duration || 0,
    };
    createCourseMutation.mutate(formattedData);
  };

  const steps = [
    { id: 1, title: "Basic Information", description: "Course title, description, and category" },
    { id: 2, title: "Content & Media", description: "Thumbnail, video, and additional content" },
    { id: 3, title: "Pricing & Settings", description: "Price, level, and publishing options" },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/instructor")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600 mt-1">Share your knowledge with the world</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" disabled>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createCourseMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id 
                      ? "bg-primary text-white" 
                      : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}>
                    {step.id}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-8 h-0.5 w-16 ${
                    currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter an engaging course title..."
                    className="mt-1"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    {...form.register("shortDescription")}
                    placeholder="Brief description for course cards..."
                    className="mt-1"
                  />
                  {form.formState.errors.shortDescription && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.shortDescription.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Provide a detailed description of what students will learn..."
                    rows={6}
                    className="mt-1"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select onValueChange={(value) => form.setValue("categoryId", parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Content & Media */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Content & Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="thumbnailUrl">Course Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    {...form.register("thumbnailUrl")}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended size: 800x450 pixels
                  </p>
                  {form.formState.errors.thumbnailUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.thumbnailUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="videoUrl">Intro Video URL</Label>
                  <Input
                    id="videoUrl"
                    {...form.register("videoUrl")}
                    placeholder="https://example.com/intro-video.mp4"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Add an introduction or preview video
                  </p>
                  {form.formState.errors.videoUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.videoUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Total Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...form.register("duration", { valueAsNumber: true })}
                    placeholder="120"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated total course duration in minutes
                  </p>
                  {form.formState.errors.duration && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.duration.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Course Structure</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    After creating your course, you'll be able to add sections and lessons to organize your content.
                  </p>
                  <Badge variant="secondary">Available after course creation</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing & Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Course Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price")}
                      placeholder="99.99"
                      className="mt-1"
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="level">Course Level *</Label>
                    <Select onValueChange={(value) => form.setValue("level", value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select level..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.level && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.level.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Publishing Options</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    Your course will be created as a draft. You can publish it later once you've added all content and lessons.
                  </p>
                  <Badge variant="outline">Will be saved as draft</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex space-x-4">
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
