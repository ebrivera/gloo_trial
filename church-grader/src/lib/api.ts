import { Church, JobStatus } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchChurches(): Promise<Church[]> {
  const r = await fetch(`${BASE}/churches`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load churches");
  return r.json();
}

export async function startEvaluation(churchIds: string[], questions: string[]) {
  const r = await fetch(`${BASE}/evaluate`, {
    method: "POST", 
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ churchIds, questions, force:false })
  });
  if (!r.ok) throw new Error("Failed to start evaluation");
  return r.json() as Promise<{ jobId: string }>;
}

export async function getResults(jobId: string): Promise<JobStatus> {
  const r = await fetch(`${BASE}/results?jobId=${encodeURIComponent(jobId)}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch results");
  return r.json();
}
