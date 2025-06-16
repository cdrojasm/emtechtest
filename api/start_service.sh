#!/bin/bash

echo "Starting the service..."
# sleep 10
echo "Service is starting, please wait..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload