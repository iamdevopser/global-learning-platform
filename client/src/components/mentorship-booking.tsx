import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Star, Video, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Mentor {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  email?: string;
  specialties?: string[];
  hourlyRate?: number;
  rating?: number;
  totalSessions?: number;
  bio?: string;
}

interface MentorshipBookingProps {
  mentor: Mentor;
  onBookingComplete?: () => void;
}

export default function MentorshipBooking({ mentor, onBookingComplete }: MentorshipBookingProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const scheduledAt = new Date(data.scheduledAt);
      return api.createMentorshipSession({
        mentorId: mentor.id,
        title: data.title,
        description: data.description,
        scheduledAt,
        duration: data.duration,
        price: ((mentor.hourlyRate || 50) * (data.duration / 60)).toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Booked Successfully",
        description: "Your mentorship session has been scheduled. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/sessions'] });
      setIsBooking(false);
      setFormData({ title: '', description: '', scheduledAt: '', duration: 60 });
      onBookingComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book mentorship session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(formData.scheduledAt);
    if (selectedDate <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate(formData);
  };

  const calculatePrice = () => {
    const hourlyRate = mentor.hourlyRate || 50;
    return (hourlyRate * (formData.duration / 60)).toFixed(2);
  };

  if (!isBooking) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={mentor.profileImageUrl || ""} 
                alt={`${mentor.firstName} ${mentor.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="text-lg">
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {mentor.firstName} {mentor.lastName}
              </CardTitle>
              <CardDescription className="mt-1">
                {mentor.email}
              </CardDescription>
              
              {mentor.rating && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    ({mentor.totalSessions || 0} sessions)
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${mentor.hourlyRate || 50}
              </div>
              <div className="text-sm text-slate-500">per hour</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {mentor.specialties && mentor.specialties.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mentor.bio && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">About</h4>
              <p className="text-sm text-slate-600">{mentor.bio}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={() => setIsBooking(true)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
            <Button variant="outline">
              <Video className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Book Mentorship Session</span>
        </CardTitle>
        <CardDescription>
          Schedule a one-on-one session with {mentor.firstName} {mentor.lastName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., React Development Help"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what you'd like to discuss..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Session Summary</span>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formData.duration} min
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Rate:</span>
                <span>${mentor.hourlyRate || 50}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span>{formData.duration} minutes</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4" />
                  {calculatePrice()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsBooking(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={bookingMutation.isPending}
              className="flex-1"
            >
              {bookingMutation.isPending ? (
                "Booking..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Book Session
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
