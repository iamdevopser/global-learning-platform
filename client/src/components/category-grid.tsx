import { Link } from "wouter";
import { Category } from "@shared/schema";
import { 
  Code, 
  Briefcase, 
  Palette, 
  Megaphone, 
  Camera, 
  Music,
  BookOpen,
  Calculator,
  Globe,
  Heart,
  Lightbulb,
  Zap
} from "lucide-react";

interface CategoryGridProps {
  categories: Category[];
}

const categoryIcons: Record<string, any> = {
  development: Code,
  business: Briefcase,
  design: Palette,
  marketing: Megaphone,
  photography: Camera,
  music: Music,
  education: BookOpen,
  mathematics: Calculator,
  language: Globe,
  health: Heart,
  science: Lightbulb,
  technology: Zap,
};

const categoryColors: Record<string, string> = {
  development: "bg-blue-100 text-primary group-hover:bg-blue-200",
  business: "bg-green-100 text-green-600 group-hover:bg-green-200",
  design: "bg-purple-100 text-secondary group-hover:bg-purple-200",
  marketing: "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
  photography: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200",
  music: "bg-pink-100 text-pink-600 group-hover:bg-pink-200",
  education: "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200",
  mathematics: "bg-red-100 text-red-600 group-hover:bg-red-200",
  language: "bg-teal-100 text-teal-600 group-hover:bg-teal-200",
  health: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
  science: "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200",
  technology: "bg-violet-100 text-violet-600 group-hover:bg-violet-200",
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const IconComponent = categoryIcons[name] || BookOpen;
    return IconComponent;
  };

  const getColorForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    return categoryColors[name] || "bg-gray-100 text-gray-600 group-hover:bg-gray-200";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {categories.map((category) => {
        const IconComponent = getIconForCategory(category.name);
        const colorClass = getColorForCategory(category.name);
        
        return (
          <Link key={category.id} href={`/courses?categoryId=${category.id}`}>
            <div className="text-center group cursor-pointer">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${colorClass}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">
                View courses
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
