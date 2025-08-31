"use client";

import { useState, useEffect } from "react";
import { Church, JobStatus, Grade } from "@/lib/types";
import { fetchChurches, startEvaluation, getResults } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Menu, Play, Loader2 } from "lucide-react";

// Components
import { ChurchSelector } from "@/components/ChurchSelector";
import { QuestionInput } from "@/components/QuestionInput";
import { SummaryHeader } from "@/components/SummaryHeader";
import { ResultsTable } from "@/components/ResultsTable";

export default function Home() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>(["What time is service?"]);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [filterGrade, setFilterGrade] = useState<"ALL" | Grade>("ALL");
  const [filterQuestion, setFilterQuestion] = useState<string | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);

  // Load churches on mount
  useEffect(() => {
    fetchChurches()
      .then(setChurches)
      .catch(error => {
        console.error("Failed to fetch churches:", error);
        toast.error("Failed to load churches from backend");
      })
      .finally(() => setIsLoadingChurches(false));
  }, []);

  // Poll for results when job is running
  useEffect(() => {
    if (job?.status === "running" && job.jobId) {
      const interval = setInterval(async () => {
        try {
          const updatedJob = await getResults(job.jobId);
          setJob(updatedJob);
          
          if (updatedJob.status !== "running") {
            clearInterval(interval);
            if (updatedJob.status === "complete") {
              toast.success("Evaluation completed successfully!");
            } else if (updatedJob.status === "error") {
              toast.error("Evaluation failed: " + (updatedJob.error || "Unknown error"));
            }
          }
        } catch (error) {
          console.error("Failed to fetch results:", error);
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [job?.status, job?.jobId]);

  const handleStartEvaluation = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one church");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsLoading(true);
    try {
      const { jobId } = await startEvaluation(selected, questions);
      const initialJob: JobStatus = {
        jobId,
        status: "running",
        progress: 0,
        results: [],
      };
      setJob(initialJob);
      toast.success("Evaluation started successfully!");
    } catch (error) {
      console.error("Failed to start evaluation:", error);
      toast.error("Failed to start evaluation");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleResults = job?.results || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Church Chatbot Grader
          </h1>
          <p className="text-gray-600">
            Evaluate the accuracy of pastors.ai chatbot responses against ground truth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Menu className="h-4 w-4 mr-2" />
                    Configure Evaluation
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Configuration</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <ChurchSelector
                      churches={churches}
                      selected={selected}
                      onSelectionChange={setSelected}
                      isLoading={isLoadingChurches}
                    />
                    <QuestionInput
                      questions={questions}
                      onQuestionsChange={setQuestions}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden lg:block space-y-6">
              <ChurchSelector
                churches={churches}
                selected={selected}
                onSelectionChange={setSelected}
                isLoading={isLoadingChurches}
              />
              <QuestionInput
                questions={questions}
                onQuestionsChange={setQuestions}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleStartEvaluation}
                disabled={isLoading || selected.length === 0 || questions.length === 0 || isLoadingChurches}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Starting..." : "Start Evaluation"}
              </Button>
            </div>

            {/* Summary Header */}
            {job && <SummaryHeader job={job} />}

            {/* Results Table */}
            {visibleResults.length > 0 && (
              <ResultsTable
                results={visibleResults}
                churches={churches}
                filterGrade={filterGrade}
                filterQuestion={filterQuestion}
                onFilterGradeChange={setFilterGrade}
                onFilterQuestionChange={setFilterQuestion}
              />
            )}

            {/* Empty State */}
            {!job && !isLoadingChurches && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Play className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to evaluate
                </h3>
                <p className="text-gray-600">
                  Select churches and questions, then click &quot;Start Evaluation&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
