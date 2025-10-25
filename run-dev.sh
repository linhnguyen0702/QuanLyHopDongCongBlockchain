#!/bin/bash

echo "Starting Contract Management System..."
echo

echo "1. Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "2. Waiting for backend to start..."
sleep 5

echo "3. Starting frontend..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "4. Both servers are starting..."
echo "   - Backend: http://localhost:5000"
echo "   - Frontend: http://localhost:3000"
echo

# Wait for user to stop
echo "Press Ctrl+C to stop both servers..."
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
