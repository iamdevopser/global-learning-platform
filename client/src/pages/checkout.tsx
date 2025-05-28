import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface CheckoutFormProps {
  courseId: number;
  course: any;
  clientSecret: string;
}

function CheckoutForm({ courseId, course, clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "There was an error processing your payment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful!",
          description: "You have been enrolled in the course. Redirecting to your dashboard...",
        });
        
        // Redirect to dashboard after successful payment
        setTimeout(() => {
          setLocation("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-slate-600 mt-2">Complete your purchase to start learning</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=80"}
                    alt={course.title}
                    className="w-20 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {course.description?.substring(0, 100)}...
                    </p>
                    <Badge className="mt-2" variant="secondary">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span>{formatPrice(course.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(course.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What you'll get */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>What you'll get</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Lifetime access to course content</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Access on mobile and desktop</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Direct access to instructor</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Information</span>
                </CardTitle>
                <CardDescription>
                  Your payment information is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <PaymentElement 
                      options={{
                        layout: "tabs",
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Lock className="h-4 w-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={!stripe || !elements || isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        Complete Purchase • {formatPrice(course.price)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    By completing your purchase, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Security badges */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <Lock className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get course ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = parseInt(urlParams.get("courseId") || "");

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['/api/courses', courseId],
    queryFn: () => api.getCourse(courseId),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!courseId) {
      setError("Invalid course ID");
      setIsLoading(false);
      return;
    }

    if (course) {
      const amount = parseFloat(course.price);
      
      if (amount <= 0) {
        setError("This course is free. No payment required.");
        setIsLoading(false);
        return;
      }

      // Create payment intent
      api.createPaymentIntent(amount, courseId)
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setError("Failed to initialize payment");
          }
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
          setError("Failed to initialize payment. Please try again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [course, courseId]);

  if (!courseId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Invalid Course
              </h3>
              <p className="text-slate-600 mb-6">
                No course selected for checkout.
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

  if (courseLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
            <div>
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Course Not Found
              </h3>
              <p className="text-slate-600 mb-6">
                The course you're trying to purchase could not be found.
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Payment Error
              </h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="space-x-4">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Wrap the form in Elements provider
  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
          },
        },
      }}
    >
      <CheckoutForm courseId={courseId} course={course} clientSecret={clientSecret} />
    </Elements>
  );
}
