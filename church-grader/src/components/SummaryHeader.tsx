"use client";

import { JobStatus, Grade } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GradeBadge } from "./GradeBadge";

interface SummaryHeaderProps {
  job: JobStatus | null;
}

export function SummaryHeader({ job }: SummaryHeaderProps) {
  const getGradeCount = (grade: Grade) => {
    if (!job?.results) return 0;
    return job.results.filter(result => result.grade === grade).length;
  };

  const getGradePercentage = (grade: Grade) => {
    if (!job?.results || job.results.length === 0) return 0;
    return Math.round((getGradeCount(grade) / job.results.length) * 100);
  };

  const grades: Grade[] = ["A", "B", "C", "D", "F", "N/A"];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {job?.status === "running" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Evaluation Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {grades.map((grade) => (
          <Card key={grade} className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <GradeBadge grade={grade} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getGradeCount(grade)}</div>
              <div className="text-sm text-muted-foreground">
                {getGradePercentage(grade)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Results */}
      {job?.results && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{job.results.length}</div>
              <div className="text-sm text-muted-foreground">Total Evaluations</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
