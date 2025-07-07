import requests
import json
import time

BACKEND_URL = "https://631d4401-442b-4235-96d9-59ab05a2a184.preview.emergentagent.com"

def create_user(email, password, full_name, country, age):
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "country": country,
        "age": age
    }
    
    print(f"Creating user: {email}")
    try:
        response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
        
        if response.status_code == 200:
            print(f"✅ User created successfully: {email}")
            return True
        else:
            print(f"❌ Failed to create user: {email} - Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating user {email}: {str(e)}")
        return False

def test_login(email, password):
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/login", json=payload)
        
        if response.status_code == 200:
            print(f"✅ Login successful: {email}")
            return True
        else:
            print(f"❌ Login failed: {email}")
            return False
    except Exception as e:
        print(f"❌ Error logging in {email}: {str(e)}")
        return False

print("Creating fresh test users on production backend...")

# Create fresh users with unique emails
timestamp = str(int(time.time()))

user1_email = f"vincent.kudjoe.{timestamp}@example.com"
user2_email = f"vincent.gbewonyo.{timestamp}@example.com"

user1_created = create_user(
    email=user1_email,
    password="password123",
    full_name="Vincent Kudjoe",
    country="Ghana",
    age=28
)

user2_created = create_user(
    email=user2_email,
    password="password123", 
    full_name="Vincent Gbewonyo",
    country="Ghana",
    age=30
)

print("\nTesting login for new users...")

if user1_created:
    test_login(user1_email, "password123")

if user2_created:
    test_login(user2_email, "password123")

print(f"\n✅ Fresh test users created!")
print(f"User 1: {user1_email} / password123 (Vincent Kudjoe)")
print(f"User 2: {user2_email} / password123 (Vincent Gbewonyo)")
print("\nUse these credentials to test the connections functionality!")
