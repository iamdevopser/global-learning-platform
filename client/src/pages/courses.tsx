import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import CourseCard from "@/components/course-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: courses, isLoading: coursesLoading, error } = useQuery({
    queryKey: ['/api/courses', { published: true }],
    queryFn: () => api.getCourses({ published: true }),
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => api.getCategories(),
  });

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || 
      course.categoryId?.toString() === selectedCategory;
    
    const matchesLevel = !selectedLevel || selectedLevel === "all" || 
      course.level === selectedLevel;
    
    const matchesPrice = !priceFilter || (() => {
      const price = parseFloat(course.price);
      switch (priceFilter) {
        case "free": return price === 0;
        case "0-50": return price > 0 && price <= 50;
        case "50-100": return price > 50 && price <= 100;
        case "100+": return price > 100;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  }) || [];

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        // Placeholder rating sort
        return 0;
      default: // popularity
        return 0;
    }
  });

  const handleEnrollment = (courseId: number) => {
    // In a real app, this would handle enrollment logic
    toast({
      title: "Enrollment Started",
      description: "Redirecting to course details...",
    });
    setTimeout(() => {
      window.location.href = `/courses/${courseId}`;
    }, 1000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Failed to Load Courses
              </h3>
              <p className="text-slate-600 mb-6">
                There was an error loading the courses. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Browse Courses</h1>
          <p className="text-xl text-slate-600 mb-8">
            Discover thousands of courses from expert instructors
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search for courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Sort by Popularity</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Price</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={priceFilter === "free"}
                        onCheckedChange={(checked) => setPriceFilter(checked ? "free" : "")}
                      />
                      <span className="text-sm text-slate-600">Free</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={priceFilter === "0-50"}
                        onCheckedChange={(checked) => setPriceFilter(checked ? "0-50" : "")}
                      />
                      <span className="text-sm text-slate-600">$0 - $50</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={priceFilter === "50-100"}
                        onCheckedChange={(checked) => setPriceFilter(checked ? "50-100" : "")}
                      />
                      <span className="text-sm text-slate-600">$50 - $100</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={priceFilter === "100+"}
                        onCheckedChange={(checked) => setPriceFilter(checked ? "100+" : "")}
                      />
                      <span className="text-sm text-slate-600">$100+</span>
                    </label>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Rating</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox />
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">4.5 & up</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox />
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="h-3 w-3 text-slate-300" />
                        </div>
                        <span className="text-sm text-slate-600">4.0 & up</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedLevel("");
                    setPriceFilter("");
                    setSortBy("popularity");
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600">
                Showing {sortedCourses.length} courses
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {coursesLoading ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : sortedCourses.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {sortedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      teacher: { firstName: "Expert", lastName: "Instructor" },
                      enrollmentCount: Math.floor(Math.random() * 500) + 50,
                      avgRating: 4.5 + Math.random() * 0.5,
                    }}
                    onEnroll={() => handleEnrollment(course.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Try adjusting your search criteria or filters to find more courses.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedLevel("");
                    setPriceFilter("");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {sortedCourses.length > 0 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <span className="px-2 text-slate-500">...</span>
                <Button variant="outline">10</Button>
                <Button variant="outline">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
