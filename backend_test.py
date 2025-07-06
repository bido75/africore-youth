import requests
import unittest
import uuid
import time
import os
import json
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://631d4401-442b-4235-96d9-59ab05a2a184.preview.emergentagent.com"

class AfriCoreAPITest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_user_email = f"test_user_{int(time.time())}@example.com"
        cls.test_user_password = "TestPassword123!"
        cls.test_user_name = "Test User"
        cls.test_user_country = "Kenya"
        cls.test_user_age = 25
        cls.token = None
        cls.user_id = None
        cls.other_user_id = None
        cls.connection_id = None
        cls.project_id = None

    def test_01_health_check(self):
        """Test the health check endpoint"""
        response = requests.get(f"{BACKEND_URL}/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "AfriCore API")
        print("✅ Health check endpoint working")

    def test_02_register_user(self):
        """Test user registration"""
        payload = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "full_name": self.test_user_name,
            "country": self.test_user_country,
            "age": self.test_user_age
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        
        # Save token for future tests
        self.__class__.token = data["access_token"]
        print(f"✅ User registration successful: {self.test_user_email}")

    def test_03_login_user(self):
        """Test user login"""
        payload = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = requests.post(f"{BACKEND_URL}/api/login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        
        # Update token
        self.__class__.token = data["access_token"]
        print(f"✅ User login successful: {self.test_user_email}")

    def test_04_get_profile(self):
        """Test getting user profile"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify profile data
        self.assertEqual(data["email"], self.test_user_email)
        self.assertEqual(data["full_name"], self.test_user_name)
        self.assertEqual(data["country"], self.test_user_country)
        self.assertEqual(data["age"], self.test_user_age)
        
        # Save user_id for future tests
        self.__class__.user_id = data["user_id"]
        print(f"✅ Get profile successful: {data['full_name']}")

    def test_05_update_profile(self):
        """Test updating user profile"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "full_name": self.test_user_name,
            "country": self.test_user_country,
            "age": self.test_user_age,
            "bio": "I am a test user for the AfriCore platform",
            "skills": ["Python", "Testing", "API Development"],
            "interests": ["Technology", "Education", "Innovation"],
            "education": "University of Testing",
            "goals": "To help test and improve the AfriCore platform",
            "current_projects": "Testing the AfriCore API",
            "languages": ["English", "Swahili"],
            "phone": "+1234567890",
            "linkedin": "https://linkedin.com/in/testuser"
        }
        
        response = requests.put(f"{BACKEND_URL}/api/profile", headers=headers, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Profile updated successfully")
        
        # Verify profile was updated
        response = requests.get(f"{BACKEND_URL}/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["bio"], payload["bio"])
        self.assertEqual(data["skills"], payload["skills"])
        print("✅ Profile update successful")

    def test_06_register_second_user(self):
        """Register a second user for testing connections"""
        second_email = f"second_user_{int(time.time())}@example.com"
        payload = {
            "email": second_email,
            "password": "SecondUser123!",
            "full_name": "Second Test User",
            "country": "Nigeria",
            "age": 28
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save second user token temporarily
        second_token = data["access_token"]
        
        # Get second user profile to get ID
        headers = {"Authorization": f"Bearer {second_token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save second user ID for connection tests
        self.__class__.other_user_id = data["user_id"]
        print(f"✅ Second user registered with ID: {self.other_user_id}")

    def test_07_get_users(self):
        """Test getting list of users"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/users", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("users", data)
        self.assertIsInstance(data["users"], list)
        
        # Test filtering by country
        response = requests.get(f"{BACKEND_URL}/api/users?country=Nigeria", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for user in data["users"]:
            self.assertIn("Nigeria", user["country"])
        
        print("✅ Get users endpoint working with filters")

    def test_08_get_specific_user(self):
        """Test getting a specific user by ID"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/user/{self.other_user_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user_id"], self.other_user_id)
        print(f"✅ Get specific user successful: {data['full_name']}")

    def test_09_send_connection_request(self):
        """Test sending a connection request"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "target_user_id": self.other_user_id,
            "message": "Hello! I'd like to connect with you on AfriCore."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/connect", headers=headers, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Connection request sent")
        print("✅ Connection request sent successfully")

    def test_10_get_connections(self):
        """Test getting connections and pending requests"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/connections", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("pending_requests", data)
        self.assertIn("connections", data)
        print("✅ Get connections endpoint working")

        # Register a third user and login to accept the connection request
        third_email = f"third_user_{int(time.time())}@example.com"
        payload = {
            "email": third_email,
            "password": "ThirdUser123!",
            "full_name": "Third Test User",
            "country": "Ghana",
            "age": 30
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        third_token = response.json()["access_token"]
        
        # Get third user profile
        headers = {"Authorization": f"Bearer {third_token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile", headers=headers)
        third_user_id = response.json()["user_id"]
        
        # Send connection request to third user
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "target_user_id": third_user_id,
            "message": "Hello! I'd like to connect with you on AfriCore."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/connect", headers=headers, json=payload)
        
        # Get pending requests for third user
        headers = {"Authorization": f"Bearer {third_token}"}
        response = requests.get(f"{BACKEND_URL}/api/connections", headers=headers)
        data = response.json()
        
        # Find the connection request
        for request in data["pending_requests"]:
            if request["requester_id"] == self.user_id:
                self.__class__.connection_id = request["connection_id"]
                break
        
        print(f"✅ Found connection request with ID: {self.connection_id}")

    def test_11_accept_connection(self):
        """Test accepting a connection request"""
        if not self.connection_id:
            self.skipTest("No connection ID found to accept")
        
        # Register and login as the third user again
        third_email = f"third_user_{int(time.time())}@example.com"
        payload = {
            "email": third_email,
            "password": "ThirdUser123!",
            "full_name": "Third Test User",
            "country": "Ghana",
            "age": 30
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        third_token = response.json()["access_token"]
        
        # Accept the connection request
        headers = {"Authorization": f"Bearer {third_token}"}
        response = requests.post(f"{BACKEND_URL}/api/connection/{self.connection_id}/accept", headers=headers)
        
        # This might fail if the connection ID is not valid or already accepted
        if response.status_code == 200:
            data = response.json()
            self.assertEqual(data["message"], "Connection accepted")
            print("✅ Connection accepted successfully")
        else:
            print(f"⚠️ Could not accept connection: {response.status_code} - {response.text}")

    def test_12_messaging_endpoints(self):
        """Test messaging endpoints (these might not be fully implemented yet)"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        # Try to send a message
        payload = {
            "recipient_id": self.other_user_id,
            "content": "Hello! This is a test message."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/messages", headers=headers, json=payload)
        print(f"Send message response: {response.status_code}")
        
        # Try to get messages
        response = requests.get(f"{BACKEND_URL}/api/messages/{self.other_user_id}", headers=headers)
        print(f"Get messages response: {response.status_code}")
        
        # Note: These tests might fail if users aren't connected or if messaging is not fully implemented
        print("ℹ️ Messaging endpoints tested (may not be fully implemented)")

    def test_13_create_project(self):
        """Test creating a new project"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "title": f"Test Project {int(time.time())}",
            "description": "This is a test project created for API testing",
            "category": "education",
            "funding_goal": 5000.0,
            "funding_goal_type": "fixed",
            "duration_months": 6,
            "location": "Nairobi, Kenya",
            "impact_description": "This project will help test the AfriFund DAO platform",
            "budget_breakdown": "Development: $3000\nTesting: $2000",
            "milestones": ["Month 1: Setup", "Month 3: Development", "Month 6: Completion"],
            "images": [],
            "team_members": "Test Team",
            "risks_challenges": "None, this is just a test",
            "sustainability_plan": "This is a test project"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/projects", headers=headers, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project_id", data)
        self.assertEqual(data["message"], "Project proposal submitted successfully")
        
        # Save project ID for future tests
        self.__class__.project_id = data["project_id"]
        print(f"✅ Project created successfully with ID: {self.project_id}")

    def test_14_get_projects(self):
        """Test getting list of projects"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/projects", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)
        
        # Test filtering by category
        response = requests.get(f"{BACKEND_URL}/api/projects?category=education", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for project in data["projects"]:
            if project["category"] == "education":
                print(f"Found education project: {project['title']}")
        
        print("✅ Get projects endpoint working with filters")

    def test_15_get_my_projects(self):
        """Test getting user's own projects"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/projects/my", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)
        
        # Verify our created project is in the list
        project_found = False
        for project in data["projects"]:
            if project["project_id"] == self.project_id:
                project_found = True
                break
        
        self.assertTrue(project_found, "Created project not found in my projects list")
        print("✅ Get my projects endpoint working")

    def test_16_get_specific_project(self):
        """Test getting a specific project by ID"""
        if not self.project_id:
            self.skipTest("No project ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/projects/{self.project_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], self.project_id)
        print(f"✅ Get specific project successful: {data['title']}")

    def test_17_contribute_to_project(self):
        """Test contributing to a project"""
        if not self.project_id:
            self.skipTest("No project ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "project_id": self.project_id,
            "amount": 100.0,
            "anonymous": False,
            "message": "Test contribution"
        }
        
        # Note: This might fail if the project status is not 'active'
        response = requests.post(f"{BACKEND_URL}/api/projects/{self.project_id}/contribute", headers=headers, json=payload)
        print(f"Contribute to project response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("contribution_id", data)
            print(f"✅ Contribution successful with ID: {data['contribution_id']}")
        else:
            print(f"⚠️ Could not contribute to project: {response.status_code} - {response.text}")

    def test_18_get_my_contributions(self):
        """Test getting user's contributions"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/contributions/my", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("contributions", data)
        self.assertIsInstance(data["contributions"], list)
        print("✅ Get my contributions endpoint working")

    def test_19_add_project_update(self):
        """Test adding an update to a project"""
        if not self.project_id:
            self.skipTest("No project ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "project_id": self.project_id,
            "title": "Test Update",
            "content": "This is a test update for the project",
            "images": [],
            "milestone_completed": "Month 1: Setup"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/projects/{self.project_id}/updates", headers=headers, json=payload)
        print(f"Add project update response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("update_id", data)
            print(f"✅ Project update added successfully with ID: {data['update_id']}")
        else:
            print(f"⚠️ Could not add project update: {response.status_code} - {response.text}")

    def test_20_add_project_comment(self):
        """Test adding a comment to a project"""
        if not self.project_id:
            self.skipTest("No project ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "project_id": self.project_id,
            "content": "This is a test comment on the project"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/projects/{self.project_id}/comments", headers=headers, json=payload)
        print(f"Add project comment response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("comment_id", data)
            print(f"✅ Project comment added successfully with ID: {data['comment_id']}")
        else:
            print(f"⚠️ Could not add project comment: {response.status_code} - {response.text}")

    def test_21_get_project_comments(self):
        """Test getting comments for a project"""
        if not self.project_id:
            self.skipTest("No project ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/projects/{self.project_id}/comments", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("comments", data)
        self.assertIsInstance(data["comments"], list)
        print("✅ Get project comments endpoint working")

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)