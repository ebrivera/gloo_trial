from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import json
import asyncio
import uuid
from datetime import datetime
import sys
import os

from pathlib import Path as _Path
_DATA_DIR = _Path(__file__).resolve().parent / "data"


# Add the parent directory to path to import the evaluation system
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from main import run_batch
    from clean_data import clean_church_data
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    raise

app = FastAPI(title="Church Chatbot Grader API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for jobs (in production, use a database)
jobs = {}

class Church(BaseModel):
    id: str
    name: str
    chatbot_url: str
    website_url: str

class EvaluationRequest(BaseModel):
    churchIds: List[str]
    questions: List[str]
    force: bool = False

class JobStatus(BaseModel):
    jobId: str
    status: str  # "running", "complete", "error"
    progress: int
    results: List[dict]
    error: Optional[str] = None

def load_churches_from_csv():
    """Load churches from the cleaned CSV file"""
    try:
        # Load the cleaned CSV file
        csv_path = str(_DATA_DIR / 'churches_cleaned.csv')
        df = pd.read_csv(csv_path)
        
        churches = []
        for _, row in df.iterrows():
            # Extract church name from chatbot handle
            chatbot_handle = row['Chatbot']
            church_name = chatbot_handle.replace('@', '').replace('_', ' ').title()
            
            churches.append(Church(
                id=chatbot_handle,  # Use the @handle as ID
                name=church_name,
                chatbot_url=f"https://pastors.ai/{chatbot_handle}",
                website_url=row['Website']
            ))
        
        return churches
    except Exception as e:
        print(f"Error loading churches: {e}")
        return []

def run_evaluation_background(job_id: str, church_ids: List[str], questions: List[str]):
    """Background task to run the evaluation"""
    try:
        # Create a temporary CSV with selected churches
        csv_path = str(_DATA_DIR / 'churches_cleaned.csv')
        df = pd.read_csv(csv_path)
        selected_df = df[df['Chatbot'].isin(church_ids)]
        
        temp_csv_path = f"temp_evaluation_{job_id}.csv"
        selected_df.to_csv(temp_csv_path, index=False)
        
        # Update job status to running
        jobs[job_id] = {
            "jobId": job_id,
            "status": "running",
            "progress": 0,
            "results": [],
            "error": None
        }
        
        # Run the evaluation
        results_df = run_batch(temp_csv_path, f"temp_report_{job_id}.csv", f"temp_report_{job_id}.json")
        
        # Convert results to the expected format
        results = []
        for _, row in results_df.iterrows():
            # Extract church ID from chatbot URL
            church_id = row['chatbot_url'].split('/')[-1]
            
            results.append({
                "churchId": church_id,
                "question": "What time is service?",  # Default question
                "bot_answer": row['bot_answer'],
                "gpt_answer": row['gpt_answer'],
                "grade": row['grade'],
                "soft_match": row['soft_match'],
                "justification": row['justification'],
                "timestamp": datetime.now().isoformat()
            })
        
        # Update job status to complete
        jobs[job_id] = {
            "jobId": job_id,
            "status": "complete",
            "progress": 100,
            "results": results,
            "error": None
        }
        
        # Clean up temporary files
        try:
            os.remove(temp_csv_path)
            os.remove(f"temp_report_{job_id}.csv")
            os.remove(f"temp_report_{job_id}.json")
        except:
            pass
            
    except Exception as e:
        # Update job status to error
        jobs[job_id] = {
            "jobId": job_id,
            "status": "error",
            "progress": 0,
            "results": [],
            "error": str(e)
        }

@app.get("/")
async def root():
    return {"message": "Church Chatbot Grader API"}

@app.get("/churches", response_model=List[Church])
async def get_churches():
    """Get all available churches from the CSV file"""
    return load_churches_from_csv()

@app.post("/evaluate")
async def start_evaluation(request: EvaluationRequest, background_tasks: BackgroundTasks):
    """Start a new evaluation job"""
    if not request.churchIds:
        raise HTTPException(status_code=400, detail="No churches selected")
    
    if not request.questions:
        raise HTTPException(status_code=400, detail="No questions provided")
    
    # Generate a unique job ID
    job_id = str(uuid.uuid4())
    
    # Add the evaluation task to background tasks
    background_tasks.add_task(
        run_evaluation_background, 
        job_id, 
        request.churchIds, 
        request.questions
    )
    
    return {"jobId": job_id}

@app.get("/results")
async def get_results(jobId: str):
    """Get the status and results of a job"""
    if jobId not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[jobId]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test that we can load churches (basic functionality check)
        churches = load_churches_from_csv()
        return {
            "status": "healthy", 
            "timestamp": datetime.now().isoformat(),
            "churches_loaded": len(churches),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
