import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen, Users, TrendingUp, Lightbulb, Award } from "lucide-react";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      return apiRequest("PATCH", "/api/auth/user/role", { role });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Learning Platform!",
        description: `You're all set up as a ${selectedRole}. Let's start your learning journey!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Redirect based on role
      if (selectedRole === "teacher") {
        setLocation("/teacher-dashboard");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Setting Up Account",
        description: error.message || "Failed to set up your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    updateRoleMutation.mutate(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to Global Learning Platform!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Choose your role to get started
          </p>
          <p className="text-sm text-slate-500">
            You can always change this later in your profile settings
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Role */}
          <Card 
            className="relative cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-blue-200"
            onClick={() => handleRoleSelect("student")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">I'm a Student</CardTitle>
              <CardDescription className="text-base">
                I want to learn new skills and take courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-700">Access thousands of courses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-700">Track your learning progress</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-700">Earn certificates and achievements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-700">Connect with expert mentors</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Perfect for learners
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Role */}
          <Card 
            className="relative cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-purple-200"
            onClick={() => handleRoleSelect("teacher")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-900">I'm a Teacher</CardTitle>
              <CardDescription className="text-base">
                I want to create and share courses with students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span className="text-slate-700">Create and publish courses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-slate-700">Earn money from your expertise</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-slate-700">Build your student community</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-slate-700">Offer mentorship sessions</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Perfect for educators
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {updateRoleMutation.isPending && (
          <div className="flex items-center justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-slate-600">Setting up your account...</span>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-slate-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}