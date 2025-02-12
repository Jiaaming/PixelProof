#!/bin/bash

echo "Starting backend..."
cd backend/app || exit
uvicorn main:app --reload &

echo "Starting frontend..."
cd ../../frontend || exit
npm run dev