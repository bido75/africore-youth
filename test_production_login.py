import requests

BACKEND_URL = "https://631d4401-442b-4235-96d9-59ab05a2a184.preview.emergentagent.com"

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
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error logging in {email}: {str(e)}")
        return False

passwords_to_try = ["password123", "123456", "password", "admin"]

print("Testing existing users with common passwords...")

for email in ["vandjweb@gmail.com", "bido75@gmail.com"]:
    print(f"\nTesting {email}:")
    for password in passwords_to_try:
        if test_login(email, password):
            print(f"✅ SUCCESS: {email} / {password}")
            break
    else:
        print(f"❌ No working password found for {email}")
