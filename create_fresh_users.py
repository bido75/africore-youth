import requests
import json

BACKEND_URL = "http://localhost:8001"

def create_user(email, password, full_name, country, age):
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "country": country,
        "age": age
    }
    
    print(f"Creating user: {email}")
    response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
    
    if response.status_code == 200:
        print(f"✅ User created successfully: {email}")
        return response.json()["access_token"]
    else:
        print(f"❌ Failed to create user: {email} - {response.text}")
        return None

def login_user(email, password):
    payload = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BACKEND_URL}/api/login", json=payload)
    
    if response.status_code == 200:
        print(f"✅ Login successful: {email}")
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {email} - {response.text}")
        return None

# Create fresh test users
user1_token = create_user(
    email="vincent.kudjoe.test@example.com",
    password="password123",
    full_name="Vincent Kudjoe",
    country="Ghana",
    age=28
)

user2_token = create_user(
    email="vincent.gbewonyo.test@example.com",
    password="password123", 
    full_name="Vincent Gbewonyo",
    country="Ghana",
    age=30
)

if user1_token and user2_token:
    print("\n✅ Both test users created successfully!")
    print(f"User 1: vincent.kudjoe.test@example.com / password123")
    print(f"User 2: vincent.gbewonyo.test@example.com / password123")
else:
    print("\n❌ Failed to create test users")
