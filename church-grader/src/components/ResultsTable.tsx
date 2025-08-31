"use client";

import { useState, useMemo } from "react";
import { EvaluationResult, Church, Grade } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradeBadge } from "./GradeBadge";
import { Check, X, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

interface ResultsTableProps {
  results: EvaluationResult[];
  churches: Church[];
  filterGrade: "ALL" | Grade;
  filterQuestion: string | "ALL";
  onFilterGradeChange: (grade: "ALL" | Grade) => void;
  onFilterQuestionChange: (question: string | "ALL") => void;
}

export function ResultsTable({ 
  results, 
  churches, 
  filterGrade, 
  filterQuestion, 
  onFilterGradeChange, 
  onFilterQuestionChange 
}: ResultsTableProps) {
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesGrade = filterGrade === "ALL" || result.grade === filterGrade;
      const matchesQuestion = filterQuestion === "ALL" || result.question === filterQuestion;
      const matchesSearch = searchTerm === "" || 
        result.bot_answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.gpt_answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.justification.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesGrade && matchesQuestion && matchesSearch;
    });
  }, [results, filterGrade, filterQuestion, searchTerm]);

  const getChurchName = (churchId: string) => {
    const church = churches.find(c => c.id === churchId);
    return church?.name || churchId;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const uniqueQuestions = useMemo(() => {
    const questions = [...new Set(results.map(r => r.question))];
    return questions.sort();
  }, [results]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search in answers and justifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterGrade} onValueChange={(value) => onFilterGradeChange(value as "ALL" | Grade)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Grades</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQuestion} onValueChange={(value) => onFilterQuestionChange(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Question" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Questions</SelectItem>
                {uniqueQuestions.map(question => (
                  <SelectItem key={question} value={question}>
                    {question.length > 30 ? `${question.substring(0, 30)}...` : question}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Church</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Soft Match</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <GradeBadge grade={result.grade} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {getChurchName(result.churchId)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {result.question}
                    </TableCell>
                    <TableCell>
                      {result.soft_match ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResult(result)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Bot Answer</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedResult.bot_answer, "Bot answer")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={selectedResult.bot_answer}
                    readOnly
                    className="font-mono text-sm"
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Ground Truth</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedResult.gpt_answer, "Ground truth")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={selectedResult.gpt_answer}
                    readOnly
                    className="font-mono text-sm"
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Justification</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedResult.justification, "Justification")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={selectedResult.justification}
                    readOnly
                    className="font-mono text-sm"
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t">
                <GradeBadge grade={selectedResult.grade} />
                <span className="text-sm text-muted-foreground">
                  Soft Match: {selectedResult.soft_match ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
