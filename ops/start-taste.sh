#!/bin/bash
# Starts the Taste Tuner environment (Frontend + Backend)

# Kill any existing processes on ports 5173, 8000
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Set Python path to ensure 'api' module is found
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Start Backend from ROOT to prevent ModuleNotFoundError
echo "🔥 Starting Taste Backend..."
uvicorn api.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "🎨 Starting Taste Frontend..."
npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo "✅ Taste Tuner live at http://localhost:5173/taste"
echo "Press Ctrl+C to stop."

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
