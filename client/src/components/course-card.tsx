import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@shared/schema";
import { Clock, Star, User } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-primary text-4xl font-bold">
                {course.title.charAt(0)}
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-primary text-xs font-semibold"
            >
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm ml-1">{course.rating || '0.0'}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <User className="w-4 h-4 mr-1" />
            <span>Instructor</span>
          </div>
          
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{course.duration ? `${course.duration} min` : 'Self-paced'}</span>
            </div>
            <div className="font-bold text-lg text-gray-900">
              ${course.price}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
