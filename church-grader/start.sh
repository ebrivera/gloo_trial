#!/bin/bash

# Start the backend
echo "Starting Python backend..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend
echo "Starting Next.js frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "Both servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Clean up processes
kill $BACKEND_PID
kill $FRONTEND_PID
echo "Servers stopped"
