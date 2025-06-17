#!/bin/bash

# Simple test with a small base64 image
echo "Testing KLING API integration..."

# Create a tiny 1x1 pixel red PNG image in base64
BASE64_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

# Test video generation
echo "1. Testing /api/generate-video..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/generate-video \
  -H "Content-Type: application/json" \
  -d "{
    \"imageUrl\": \"$BASE64_IMAGE\",
    \"prompt\": \"Camera slowly pans from left to right\",
    \"duration\": 5
  }")

echo "Response: $RESPONSE"

# Extract taskId using grep
TASK_ID=$(echo $RESPONSE | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
  echo "Failed to get task ID"
  exit 1
fi

echo "Task ID: $TASK_ID"

# Test status check
echo -e "\n2. Testing /api/video-status/$TASK_ID..."
sleep 5
curl -s http://localhost:3000/api/video-status/$TASK_ID | python3 -m json.tool