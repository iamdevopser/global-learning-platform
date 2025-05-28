import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, BookOpen, CreditCard, Users } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: BookOpen,
      title: "Courses & Learning",
      description: "Questions about courses, progress, and certificates"
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Payment methods, refunds, and subscription info"
    },
    {
      icon: Users,
      title: "Account & Profile",
      description: "Account settings, passwords, and profile management"
    },
    {
      icon: HelpCircle,
      title: "Technical Support",
      description: "Platform issues, bugs, and technical questions"
    }
  ];

  const faqs = [
    {
      category: "Courses & Learning",
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, simply browse our course catalog, click on the course you're interested in, and click the 'Enroll Now' button. If it's a paid course, you'll be directed to checkout. Free courses can be accessed immediately."
    },
    {
      category: "Courses & Learning",
      question: "Do I get a certificate after completing a course?",
      answer: "Yes! You'll receive a certificate of completion for any course you finish. Certificates are available for download from your dashboard and include verification information."
    },
    {
      category: "Courses & Learning",
      question: "Can I access courses on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and works great on all devices. You can also download our mobile app for the best learning experience on the go."
    },
    {
      category: "Courses & Learning",
      question: "How long do I have access to a course?",
      answer: "Once you enroll in a course, you have lifetime access to the content. You can learn at your own pace and revisit materials anytime."
    },
    {
      category: "Billing & Payments",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe."
    },
    {
      category: "Billing & Payments",
      question: "Can I get a refund?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course, contact our support team within 30 days of purchase for a full refund."
    },
    {
      category: "Billing & Payments",
      question: "Do you offer student discounts?",
      answer: "Yes! We offer 50% off all courses for verified students. Contact our support team with your student ID to get your discount code."
    },
    {
      category: "Account & Profile",
      question: "How do I reset my password?",
      answer: "Click the 'Forgot Password' link on the login page and enter your email address. We'll send you a link to reset your password securely."
    },
    {
      category: "Account & Profile",
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in your account settings. Go to Profile > Account Settings > Email to make changes."
    },
    {
      category: "Account & Profile",
      question: "How do I delete my account?",
      answer: "If you wish to delete your account, please contact our support team. Note that this action is permanent and cannot be undone."
    },
    {
      category: "Technical Support",
      question: "Videos won't play. What should I do?",
      answer: "First, check your internet connection. If the issue persists, try refreshing the page or clearing your browser cache. Contact support if problems continue."
    },
    {
      category: "Technical Support",
      question: "I'm having trouble downloading course materials.",
      answer: "Make sure you're logged in and have enrolled in the course. Downloads are only available for enrolled students. Check your browser's download settings if issues persist."
    },
    {
      category: "Technical Support",
      question: "The platform is running slowly. Any tips?",
      answer: "Try closing other browser tabs, clearing your cache, or switching to a different browser. For the best experience, we recommend using the latest version of Chrome, Firefox, or Safari."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find quick answers to common questions about our platform, courses, and services.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 pr-4 py-3 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="bg-blue-100 p-4 rounded-lg w-fit mx-auto mb-4">
                    <category.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {searchQuery && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">
                  Search Results ({filteredFaqs.length} found)
                </h3>
              </div>
            )}
            
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <div>
                      <div className="font-semibold text-lg mb-1">{faq.question}</div>
                      <div className="text-sm text-blue-600">{faq.category}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try searching with different keywords or browse our categories above.
                </p>
                <Button onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Still Need Help?</h2>
          <p className="text-xl mb-8 opacity-90">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Support
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Live Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}