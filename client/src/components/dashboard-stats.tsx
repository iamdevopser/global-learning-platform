import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

function StatsCard({ title, value, change, changeLabel, icon, color = 'primary' }: StatsCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'destructive': return 'text-red-600';
      default: return 'text-primary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={`p-2 rounded-lg bg-slate-100 ${getColorClasses()}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 mb-1">
          {value}
        </div>
        {change !== undefined && changeLabel && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {Math.abs(change)}% {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: Array<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'destructive';
  }>;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
