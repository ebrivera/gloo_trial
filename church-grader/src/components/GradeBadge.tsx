import { Badge } from "@/components/ui/badge";
import { Grade } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GradeBadgeProps {
  grade: Grade;
  className?: string;
}

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  const getGradeColor = (grade: Grade) => {
    switch (grade) {
      case "A":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "B":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "C":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "D":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "F":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "N/A":
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  return (
    <Badge className={cn(getGradeColor(grade), className)}>
      {grade}
    </Badge>
  );
}
