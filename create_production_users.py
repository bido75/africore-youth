import requests
import json

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
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"ℹ️ User already exists: {email}")
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
            print(f"❌ Login failed: {email} - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error logging in {email}: {str(e)}")
        return False

print("Creating users on production backend...")

# Create the specific users mentioned by the user
user1_created = create_user(
    email="vandjweb@gmail.com",
    password="password123",
    full_name="Vincent Kudjoe",
    country="Ghana",
    age=28
)

user2_created = create_user(
    email="bido75@gmail.com",
    password="password123", 
    full_name="Vincent Gbewonyo",
    country="Ghana",
    age=30
)

print("\nTesting login for created users...")

if user1_created:
    test_login("vandjweb@gmail.com", "password123")

if user2_created:
    test_login("bido75@gmail.com", "password123")

print("\n✅ User creation complete!")
print("Users can now login with:")
print("- vandjweb@gmail.com / password123 (Vincent Kudjoe)")
print("- bido75@gmail.com / password123 (Vincent Gbewonyo)")
