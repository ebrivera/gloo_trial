"use client";

import { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface QuestionInputProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

export function QuestionInput({ questions, onQuestionsChange }: QuestionInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !questions.includes(trimmedValue)) {
        onQuestionsChange([...questions, trimmedValue]);
        setInputValue("");
      }
    }
  };

  const handleRemoveQuestion = (questionToRemove: string) => {
    onQuestionsChange(questions.filter(q => q !== questionToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-add on comma
    if (value.includes(",")) {
      const parts = value.split(",");
      const newQuestion = parts[0].trim();
      if (newQuestion && !questions.includes(newQuestion)) {
        onQuestionsChange([...questions, newQuestion]);
        setInputValue(parts.slice(1).join(",").trim());
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Questions to Evaluate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Type a question and press Enter or comma to add..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <p className="text-sm text-muted-foreground">
            Press Enter or comma to add questions
          </p>
        </div>
        
        {questions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {question}
                <button
                  onClick={() => handleRemoveQuestion(question)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
