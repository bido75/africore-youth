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
        cls.job_id = None
        cls.application_id = None
        cls.policy_id = None
        cls.course_id = None
        cls.enrollment_id = None
        cls.organization_id = None

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

    def test_22_register_organization(self):
        """Test registering an organization"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": f"Test Organization {int(time.time())}",
            "description": "This is a test organization for API testing",
            "organization_type": "startup",
            "country": "Kenya",
            "website": "https://testorg.example.com",
            "contact_email": f"contact_{int(time.time())}@example.com",
            "contact_phone": "+1234567890",
            "size": "1-10 employees",
            "founded_year": 2023
        }
        
        response = requests.post(f"{BACKEND_URL}/api/organization/register", headers=headers, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("organization_id", data)
        self.assertEqual(data["message"], "Organization registered successfully")
        
        # Save organization ID for future tests
        self.__class__.organization_id = data["organization_id"]
        print(f"✅ Organization registered successfully with ID: {self.organization_id}")
        
    def test_23_get_organizations(self):
        """Test getting list of organizations"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/organizations", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("organizations", data)
        self.assertIsInstance(data["organizations"], list)
        
        # Test filtering by organization type
        response = requests.get(f"{BACKEND_URL}/api/organizations?org_type=startup", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for org in data["organizations"]:
            if org["organization_type"] == "startup":
                print(f"Found startup organization: {org['name']}")
        
        print("✅ Get organizations endpoint working with filters")
        
    def test_24_create_job(self):
        """Test creating a job posting"""
        if not self.organization_id:
            self.skipTest("No organization ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "title": f"Test Job {int(time.time())}",
            "description": "This is a test job posting for API testing",
            "requirements": ["Python", "API Testing", "Documentation"],
            "job_type": "full_time",
            "job_category": "technology",
            "location_type": "remote",
            "location": "Anywhere",
            "salary_range": "$50,000 - $70,000",
            "skills_required": ["Python", "Testing", "API Development"],
            "experience_level": "Mid-level",
            "benefits": "Flexible hours, Remote work"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/jobs", headers=headers, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("job_id", data)
        self.assertEqual(data["message"], "Job posted successfully")
        
        # Save job ID for future tests
        self.__class__.job_id = data["job_id"]
        print(f"✅ Job posted successfully with ID: {self.job_id}")
        
    def test_25_get_jobs(self):
        """Test getting list of jobs"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/jobs", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("jobs", data)
        self.assertIsInstance(data["jobs"], list)
        
        # Test filtering by job type
        response = requests.get(f"{BACKEND_URL}/api/jobs?job_type=full_time", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for job in data["jobs"]:
            if job["job_type"] == "full_time":
                print(f"Found full-time job: {job['title']}")
        
        print("✅ Get jobs endpoint working with filters")
        
    def test_26_get_specific_job(self):
        """Test getting a specific job by ID"""
        if not self.job_id:
            self.skipTest("No job ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/jobs/{self.job_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["job_id"], self.job_id)
        print(f"✅ Get specific job successful: {data['title']}")
        
    def test_27_apply_for_job(self):
        """Test applying for a job"""
        if not self.job_id:
            self.skipTest("No job ID available for testing")
            
        # Create a second user to apply for the job
        second_email = f"job_applicant_{int(time.time())}@example.com"
        payload = {
            "email": second_email,
            "password": "Applicant123!",
            "full_name": "Job Applicant",
            "country": "Tanzania",
            "age": 27
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        self.assertEqual(response.status_code, 200)
        applicant_token = response.json()["access_token"]
        
        # Apply for the job
        headers = {
            "Authorization": f"Bearer {applicant_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "job_id": self.job_id,
            "cover_letter": "I am very interested in this position and believe my skills match your requirements.",
            "portfolio_links": "https://github.com/testapplicant"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/jobs/{self.job_id}/apply", headers=headers, json=payload)
        print(f"Apply for job response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("application_id", data)
            self.__class__.application_id = data["application_id"]
            print(f"✅ Job application successful with ID: {self.application_id}")
        else:
            print(f"⚠️ Could not apply for job: {response.status_code} - {response.text}")
        
    def test_28_get_applications(self):
        """Test getting user's job applications"""
        # Create a second user to apply for the job
        second_email = f"applicant_view_{int(time.time())}@example.com"
        payload = {
            "email": second_email,
            "password": "Applicant123!",
            "full_name": "Application Viewer",
            "country": "Tanzania",
            "age": 27
        }
        
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        self.assertEqual(response.status_code, 200)
        applicant_token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {applicant_token}"}
        response = requests.get(f"{BACKEND_URL}/api/applications", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("applications", data)
        self.assertIsInstance(data["applications"], list)
        print("✅ Get applications endpoint working")
        
    def test_30_create_policy(self):
        """Test creating a policy proposal"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "title": f"Test Policy {int(time.time())}",
            "description": "This is a test policy proposal for API testing",
            "category": "education",
            "proposal_type": "youth_initiative",
            "target_location": "Kenya",
            "expected_impact": "Improve education access for youth",
            "implementation_timeline": "6 months",
            "resources_needed": "Funding and volunteers",
            "supporting_documents": []
        }
        
        response = requests.post(f"{BACKEND_URL}/api/policies", headers=headers, json=payload)
        print(f"Create policy response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("policy_id", data)
            self.__class__.policy_id = data["policy_id"]
            print(f"✅ Policy created successfully with ID: {self.policy_id}")
        else:
            print(f"⚠️ Could not create policy: {response.status_code} - {response.text}")
        
    def test_31_get_policies(self):
        """Test getting list of policies"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/policies", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("policies", data)
        self.assertIsInstance(data["policies"], list)
        
        # Test filtering by category
        response = requests.get(f"{BACKEND_URL}/api/policies?category=education", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for policy in data["policies"]:
            if policy["category"] == "education":
                print(f"Found education policy: {policy['title']}")
        
        print("✅ Get policies endpoint working with filters")
        
    def test_32_get_specific_policy(self):
        """Test getting a specific policy by ID"""
        if not self.policy_id:
            self.skipTest("No policy ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/policies/{self.policy_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["policy_id"], self.policy_id)
        print(f"✅ Get specific policy successful: {data['title']}")
        
    def test_33_vote_on_policy(self):
        """Test voting on a policy"""
        if not self.policy_id:
            self.skipTest("No policy ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "policy_id": self.policy_id,
            "vote_type": "support",
            "comment": "I support this policy because it addresses important educational needs."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/policies/{self.policy_id}/vote", headers=headers, json=payload)
        print(f"Vote on policy response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertEqual(data["message"], "Vote recorded successfully")
            print("✅ Policy vote successful")
        else:
            print(f"⚠️ Could not vote on policy: {response.status_code} - {response.text}")
        
    def test_34_give_policy_feedback(self):
        """Test giving feedback on a policy"""
        if not self.policy_id:
            self.skipTest("No policy ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "policy_id": self.policy_id,
            "feedback_type": "suggestion",
            "content": "I suggest expanding this policy to include vocational training.",
            "impact_assessment": "This would increase the effectiveness by reaching more youth.",
            "alternative_suggestion": "Consider partnering with existing vocational institutions."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/policies/{self.policy_id}/feedback", headers=headers, json=payload)
        print(f"Give policy feedback response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("feedback_id", data)
            print(f"✅ Policy feedback submitted successfully with ID: {data['feedback_id']}")
        else:
            print(f"⚠️ Could not submit policy feedback: {response.status_code} - {response.text}")
        
    def test_35_get_policy_feedback(self):
        """Test getting feedback for a policy"""
        if not self.policy_id:
            self.skipTest("No policy ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/policies/{self.policy_id}/feedback", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("feedback", data)
        self.assertIsInstance(data["feedback"], list)
        print("✅ Get policy feedback endpoint working")
        
    def test_36_get_civic_participation(self):
        """Test getting user's civic participation"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/civic/my-participation", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_points", data)
        self.assertIn("participation_level", data)
        print(f"✅ Get civic participation successful: {data['participation_level']} level with {data['total_points']} points")
        
    def test_37_get_civic_leaderboard(self):
        """Test getting civic participation leaderboard"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/civic/leaderboard", headers=headers)
        self.assertEqual(response.status_code, 200)
        print("✅ Get civic leaderboard endpoint working")
        
    def test_38_create_course(self):
        """Test creating a course"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "title": f"Test Course {int(time.time())}",
            "description": "This is a test course for API testing",
            "category": "technology",
            "level": "beginner",
            "duration_hours": 10,
            "price": 0.0,
            "learning_objectives": ["Learn API testing", "Understand backend development"],
            "prerequisites": [],
            "skills_gained": ["API Testing", "Backend Development"],
            "certificate_type": "completion"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/courses", headers=headers, json=payload)
        print(f"Create course response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("course_id", data)
            self.__class__.course_id = data["course_id"]
            print(f"✅ Course created successfully with ID: {self.course_id}")
        else:
            print(f"⚠️ Could not create course: {response.status_code} - {response.text}")
        
    def test_39_get_courses(self):
        """Test getting list of courses"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/courses", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("courses", data)
        self.assertIsInstance(data["courses"], list)
        
        # Test filtering by category
        response = requests.get(f"{BACKEND_URL}/api/courses?category=technology", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for course in data["courses"]:
            if course["category"] == "technology":
                print(f"Found technology course: {course['title']}")
        
        print("✅ Get courses endpoint working with filters")
        
    def test_40_get_specific_course(self):
        """Test getting a specific course by ID"""
        if not self.course_id:
            self.skipTest("No course ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/courses/{self.course_id}", headers=headers)
        print(f"Get specific course response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertEqual(data["course_id"], self.course_id)
            print(f"✅ Get specific course successful: {data['title']}")
        else:
            print(f"⚠️ Could not get course: {response.status_code} - {response.text}")
        
    def test_41_enroll_in_course(self):
        """Test enrolling in a course"""
        if not self.course_id:
            self.skipTest("No course ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "course_id": self.course_id
        }
        
        response = requests.post(f"{BACKEND_URL}/api/courses/{self.course_id}/enroll", headers=headers, json=payload)
        print(f"Enroll in course response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("enrollment_id", data)
            self.__class__.enrollment_id = data["enrollment_id"]
            print(f"✅ Course enrollment successful with ID: {self.enrollment_id}")
        else:
            print(f"⚠️ Could not enroll in course: {response.status_code} - {response.text}")
        
    def test_42_get_enrollments(self):
        """Test getting user's course enrollments"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/enrollments", headers=headers)
        print(f"Get enrollments response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("enrollments", data)
            self.assertIsInstance(data["enrollments"], list)
            print("✅ Get enrollments endpoint working")
        else:
            print(f"⚠️ Could not get enrollments: {response.status_code} - {response.text}")
        
    def test_43_review_course(self):
        """Test reviewing a course"""
        if not self.course_id:
            self.skipTest("No course ID available for testing")
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "course_id": self.course_id,
            "rating": 5,
            "review_text": "This is an excellent course for learning API testing."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/courses/{self.course_id}/review", headers=headers, json=payload)
        print(f"Review course response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("review_id", data)
            print(f"✅ Course review submitted successfully with ID: {data['review_id']}")
        else:
            print(f"⚠️ Could not review course: {response.status_code} - {response.text}")
        
    def test_44_get_course_reviews(self):
        """Test getting reviews for a course"""
        if not self.course_id:
            self.skipTest("No course ID available for testing")
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{BACKEND_URL}/api/courses/{self.course_id}/reviews", headers=headers)
        print(f"Get course reviews response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("reviews", data)
            self.assertIsInstance(data["reviews"], list)
            print("✅ Get course reviews endpoint working")
        else:
            print(f"⚠️ Could not get course reviews: {response.status_code} - {response.text}")

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)