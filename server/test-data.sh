#!/bin/bash

# Test Data Creation Script for Student Tracker App
# This script creates sample data including users with batch assignments

BASE_URL="http://localhost:5000/api"

echo "====================================="
echo "Creating Test Data"
echo "====================================="

# 1. Create Admin (if not exists)
echo -e "\n1. Creating Admin User..."
curl -X POST "${BASE_URL}/admin/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'

# 2. Login as Admin to get cookie
echo -e "\n\n2. Logging in as Admin..."
curl -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# 3. Create Mentor with Batch A26
echo -e "\n\n3. Creating Mentor (Batch A26)..."
MENTOR_RESPONSE=$(curl -X POST "${BASE_URL}/mentors" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "John Mentor",
    "email": "mentor@test.com",
    "password": "mentor123"
  }')
echo "$MENTOR_RESPONSE"

# Extract mentor ID (you may need jq for this, or manually get ID)
# MENTOR_ID=$(echo "$MENTOR_RESPONSE" | jq -r '._id')

# Note: Replace MENTOR_ID_HERE with actual ID from response above
MENTOR_ID="MENTOR_ID_HERE"

# 4. Assign Batch to Mentor
echo -e "\n\n4. Assigning Batch A26 to Mentor..."
curl -X PATCH "${BASE_URL}/admin/users/${MENTOR_ID}/batch" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "batchId": "A26"
  }'

# 5. Create Students with Batch A26
echo -e "\n\n5. Creating Student 1 (Batch A26)..."
STUDENT1_RESPONSE=$(curl -X POST "${BASE_URL}/students" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Alice Student",
    "email": "alice@test.com",
    "password": "student123",
    "batch": "A26"
  }')
echo "$STUDENT1_RESPONSE"

echo -e "\n\n6. Creating Student 2 (Batch A26)..."
STUDENT2_RESPONSE=$(curl -X POST "${BASE_URL}/students" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Bob Student",
    "email": "bob@test.com",
    "password": "student123",
    "batch": "A26"
  }')
echo "$STUDENT2_RESPONSE"

echo -e "\n\n7. Creating Student 3 (Batch A26)..."
STUDENT3_RESPONSE=$(curl -X POST "${BASE_URL}/students" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Charlie Student",
    "email": "charlie@test.com",
    "password": "student123",
    "batch": "A26"
  }')
echo "$STUDENT3_RESPONSE"

# 6. Create Students with Different Batch (B27)
echo -e "\n\n8. Creating Student 4 (Batch B27)..."
curl -X POST "${BASE_URL}/students" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "David Student",
    "email": "david@test.com",
    "password": "student123",
    "batch": "B27"
  }'

echo -e "\n\n9. Creating Student 5 (Batch B27)..."
curl -X POST "${BASE_URL}/students" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Emma Student",
    "email": "emma@test.com",
    "password": "student123",
    "batch": "B27"
  }'

# 7. Login as Mentor and Create Session
echo -e "\n\n10. Logging in as Mentor..."
curl -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -c mentor-cookies.txt \
  -d '{
    "email": "mentor@test.com",
    "password": "mentor123"
  }'

echo -e "\n\n11. Creating Mentorship Session..."
curl -X POST "${BASE_URL}/mentor/sessions/mentorship" \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt \
  -d '{
    "batchId": "A26",
    "date": "2026-01-15T10:00:00Z",
    "topic": "React Fundamentals"
  }'

echo -e "\n\n12. Creating Another Session..."
curl -X POST "${BASE_URL}/mentor/sessions/mentorship" \
  -H "Content-Type: application/json" \
  -b mentor-cookies.txt \
  -d '{
    "batchId": "A26",
    "date": "2026-01-20T14:00:00Z",
    "topic": "Node.js Backend Development"
  }'

# 8. Create Skills
echo -e "\n\n13. Creating Skills (as Admin)..."
curl -X POST "${BASE_URL}/admin/skills" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "JavaScript",
    "category": "technical",
    "order": 1
  }'

curl -X POST "${BASE_URL}/admin/skills" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "React",
    "category": "technical",
    "order": 2
  }'

curl -X POST "${BASE_URL}/admin/skills" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Node.js",
    "category": "technical",
    "order": 3
  }'

curl -X POST "${BASE_URL}/admin/skills" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Communication",
    "category": "soft",
    "order": 4
  }'

echo -e "\n\n====================================="
echo "Test Data Creation Complete!"
echo "====================================="
echo ""
echo "Login Credentials:"
echo "-----------------------------------"
echo "Admin:   admin@test.com / admin123"
echo "Mentor:  mentor@test.com / mentor123"
echo "Student: alice@test.com / student123"
echo "Student: bob@test.com / student123"
echo "Student: charlie@test.com / student123"
echo ""
echo "Batch Assignments:"
echo "-----------------------------------"
echo "Batch A26: John Mentor + Alice, Bob, Charlie"
echo "Batch B27: David, Emma"
echo ""
echo "Note: Remember to update MENTOR_ID in the script"
echo "after creating the mentor to assign batch!"
echo "====================================="

# Cleanup
rm -f cookies.txt mentor-cookies.txt
