import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Learn Without Limits
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Start, switch, or advance your career with thousands of courses, Professional Certificates, and degrees from world-class educators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button 
                  size="lg"
                  className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Browse All Courses
                </Button>
              </Link>
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors bg-transparent"
                >
                  Start Teaching
                </Button>
              </Link>
            </div>
            <div className="flex items-center mt-8 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold">2.5M+</div>
                <div className="text-blue-100 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15K+</div>
                <div className="text-blue-100 text-sm">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-blue-100 text-sm">Instructors</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Students learning online" 
              className="rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
