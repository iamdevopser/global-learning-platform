import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our platform",
      features: [
        "Access to free courses",
        "Basic progress tracking",
        "Community forums",
        "Mobile app access",
        "Standard support"
      ],
      limitations: [
        "Limited course library",
        "No certificates",
        "No offline access"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Best for serious learners",
      features: [
        "Access to all courses",
        "Completion certificates",
        "Offline downloads",
        "Advanced progress analytics",
        "Priority support",
        "1-on-1 mentoring sessions",
        "Project feedback",
        "Career guidance"
      ],
      limitations: [],
      buttonText: "Start Pro Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$99",
      period: "per month",
      description: "For organizations and teams",
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Bulk enrollment",
        "Custom learning paths",
        "Advanced analytics",
        "Dedicated success manager",
        "API access",
        "White-label options"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! We offer 50% off all paid plans for verified students. Contact support with your student ID."
    },
    {
      question: "What's included in the free trial?",
      answer: "The Pro trial gives you full access to all features for 14 days, no credit card required."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans if you're not satisfied."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start with our free plan or unlock premium features with Pro. 
            All plans include access to our supportive learning community.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-600" />
            <span>14-day free trial</span>
            <Check className="h-4 w-4 text-green-600" />
            <span>No credit card required</span>
            <Check className="h-4 w-4 text-green-600" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-600 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mb-4">{plan.description}</CardDescription>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Pro?</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Free Plan</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Limited course access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Basic progress tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Community access</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-6">Pro Plan</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited course access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Completion certificates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Offline downloads</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>1-on-1 mentoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners who are advancing their careers with our courses
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}