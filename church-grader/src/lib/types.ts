export type Grade = "A"|"B"|"C"|"D"|"F"|"N/A";

export interface Church { 
  id: string; 
  name: string; 
  chatbot_url: string; 
  website_url: string; 
}

export interface EvaluationResult {
  churchId: string; 
  question: string;
  bot_answer: string; 
  gpt_answer: string;
  grade: Grade; 
  soft_match: boolean; 
  justification: string;
  timestamp?: string;
}

export interface JobStatus {
  jobId: string; 
  status: "running"|"complete"|"error";
  progress: number; 
  results: EvaluationResult[]; 
  error?: string|null;
}
