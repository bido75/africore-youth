import requests
import json
import sys

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

print(f"Using backend URL: {BACKEND_URL}")

def debug_response(response, message="API Response"):
    """Print detailed API response information"""
    print(f"\n--- {message} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"JSON Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Text Response: {response.text}")
    print("-------------------\n")

def create_user(email, password, full_name, country, age):
    """Create a user account or reset password if it exists"""
    # First try to register the user
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "country": country,
        "age": age
    }
    
    print(f"Attempting to create user: {email}")
    response = requests.post(f"{BACKEND_URL}/api/register", json=payload)
    
    if response.status_code == 200:
        debug_response(response, f"User created: {email}")
        return response.json()["access_token"]
    elif response.status_code == 400 and "Email already registered" in response.text:
        print(f"User {email} already exists. Attempting to login...")
        
        # Try to login with the provided password
        login_payload = {
            "email": email,
            "password": password
        }
        login_response = requests.post(f"{BACKEND_URL}/api/login", json=login_payload)
        
        if login_response.status_code == 200:
            debug_response(login_response, f"Login successful: {email}")
            return login_response.json()["access_token"]
        else:
            debug_response(login_response, f"Login failed: {email}")
            print(f"Could not login with provided password. User exists but credentials may be different.")
            return None
    else:
        debug_response(response, f"User creation failed: {email}")
        return None

def get_user_profile(token):
    """Get user profile using token"""
    if not token:
        print("No token provided")
        return None
        
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BACKEND_URL}/api/profile", headers=headers)
    
    if response.status_code == 200:
        debug_response(response, "Get profile successful")
        return response.json()
    else:
        debug_response(response, "Get profile failed")
        return None

def main():
    # User 1: Vincent Kudjoe
    user1_token = create_user(
        email="vandjweb@gmail.com",
        password="password123",
        full_name="Vincent Kudjoe",
        country="Ghana",
        age=28
    )
    
    if user1_token:
        user1_profile = get_user_profile(user1_token)
        if user1_profile:
            print(f"User 1 created/verified: {user1_profile['full_name']} ({user1_profile['email']})")
            user1_id = user1_profile["user_id"]
        else:
            print("Failed to get User 1 profile")
            user1_id = None
    else:
        print("Failed to create/verify User 1")
        user1_id = None
    
    # User 2: Vincent Gbewonyo
    user2_token = create_user(
        email="bido75@gmail.com",
        password="password123",
        full_name="Vincent Gbewonyo",
        country="Ghana",
        age=30
    )
    
    if user2_token:
        user2_profile = get_user_profile(user2_token)
        if user2_profile:
            print(f"User 2 created/verified: {user2_profile['full_name']} ({user2_profile['email']})")
            user2_id = user2_profile["user_id"]
        else:
            print("Failed to get User 2 profile")
            user2_id = None
    else:
        print("Failed to create/verify User 2")
        user2_id = None
    
    # Test connection functionality if both users were created/verified
    if user1_id and user2_id:
        # Check if User 2 can see User 1 in the users list
        headers = {"Authorization": f"Bearer {user2_token}"}
        response = requests.get(f"{BACKEND_URL}/api/users", headers=headers)
        
        if response.status_code == 200:
            users_data = response.json()
            user1_found = False
            
            for user in users_data.get("users", []):
                if user.get("user_id") == user1_id:
                    user1_found = True
                    print(f"User 1 (Vincent Kudjoe) found in users list")
                    break
            
            if not user1_found:
                print(f"User 1 (Vincent Kudjoe) NOT found in users list")
        else:
            debug_response(response, "Get users failed")
        
        # Try to send a connection request from User 2 to User 1
        headers = {
            "Authorization": f"Bearer {user2_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "target_user_id": user1_id,
            "message": "Hello Vincent Kudjoe, I'd like to connect with you on AfriCore."
        }
        
        response = requests.post(f"{BACKEND_URL}/api/connect", headers=headers, json=payload)
        
        if response.status_code == 200:
            debug_response(response, "Connection request sent")
            print(f"Connection request sent successfully from Vincent Gbewonyo to Vincent Kudjoe")
        elif response.status_code == 400 and "Connection already exists" in response.text:
            debug_response(response, "Connection already exists")
            print(f"Connection already exists between Vincent Gbewonyo and Vincent Kudjoe")
        else:
            debug_response(response, "Connection request failed")
            print(f"Failed to send connection request")
        
        # Check connections for User 1
        headers = {"Authorization": f"Bearer {user1_token}"}
        response = requests.get(f"{BACKEND_URL}/api/connections", headers=headers)
        
        if response.status_code == 200:
            debug_response(response, "Get connections for User 1")
            data = response.json()
            
            # Check if there's a pending request from User 2
            request_found = False
            for request in data.get("pending_requests", []):
                if request.get("requester_id") == user2_id:
                    request_found = True
                    print(f"Pending connection request found from Vincent Gbewonyo to Vincent Kudjoe")
                    break
            
            if not request_found:
                print("No pending connection request found from Vincent Gbewonyo to Vincent Kudjoe")
                
            # Check if there's an accepted connection with User 2
            connection_found = False
            for connection in data.get("connections", []):
                if connection.get("other_user_id") == user2_id:
                    connection_found = True
                    print(f"Accepted connection found between Vincent Kudjoe and Vincent Gbewonyo")
                    break
            
            if not connection_found and not request_found:
                print("No connection found between Vincent Kudjoe and Vincent Gbewonyo")
        else:
            debug_response(response, "Get connections failed for User 1")
    
    print("\nSummary:")
    if user1_id:
        print(f"✅ User 1 (Vincent Kudjoe) created/verified successfully")
    else:
        print(f"❌ Failed to create/verify User 1 (Vincent Kudjoe)")
        
    if user2_id:
        print(f"✅ User 2 (Vincent Gbewonyo) created/verified successfully")
    else:
        print(f"❌ Failed to create/verify User 2 (Vincent Gbewonyo)")
        
    if user1_id and user2_id:
        print(f"✅ Connection functionality tested between the two users")
    else:
        print(f"❌ Could not test connection functionality")

if __name__ == "__main__":
    main()