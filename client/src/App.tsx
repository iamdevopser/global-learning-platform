import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import CoursePlayerPage from "@/pages/course-player-page";
import DashboardPage from "@/pages/dashboard-page";
import InstructorDashboardPage from "@/pages/instructor-dashboard-page";
import CreateCoursePage from "@/pages/create-course-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PricingPage from "@/pages/pricing-page";
import FAQPage from "@/pages/faq-page";
import CheckoutPage from "@/pages/checkout-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={CourseDetailPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/learn/:id" component={CoursePlayerPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/instructor" component={InstructorDashboardPage} />
      <ProtectedRoute path="/create-course" component={CreateCoursePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
