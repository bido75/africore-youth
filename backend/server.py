from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import uuid
from typing import Optional, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AfriCore - Pan-African Youth Network")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB connection
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
    logger.info(f"Connecting to MongoDB at: {mongo_url}")
    client = MongoClient(mongo_url)
    db = client.africore
    users_collection = db.users
    connections_collection = db.connections
    messages_collection = db.messages
    logger.info("MongoDB connected successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    country: str
    age: int

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    full_name: str
    country: str
    age: int
    bio: Optional[str] = ""
    skills: List[str] = []
    interests: List[str] = []
    education: Optional[str] = ""
    goals: Optional[str] = ""
    current_projects: Optional[str] = ""
    languages: List[str] = []
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""

class ConnectionRequest(BaseModel):
    target_user_id: str
    message: Optional[str] = ""

class Message(BaseModel):
    recipient_id: str
    content: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"user_id": user_id})
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AfriCore API"}

@app.post("/api/register", response_model=Token)
async def register(user: UserRegister):
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "country": user.country,
        "age": user.age,
        "bio": "",
        "skills": [],
        "interests": [],
        "education": "",
        "goals": "",
        "current_projects": "",
        "languages": [],
        "phone": "",
        "linkedin": "",
        "profile_image": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["user_id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_profile = {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "country": current_user["country"],
        "age": current_user["age"],
        "bio": current_user.get("bio", ""),
        "skills": current_user.get("skills", []),
        "interests": current_user.get("interests", []),
        "education": current_user.get("education", ""),
        "goals": current_user.get("goals", ""),
        "current_projects": current_user.get("current_projects", ""),
        "languages": current_user.get("languages", []),
        "phone": current_user.get("phone", ""),
        "linkedin": current_user.get("linkedin", ""),
        "profile_image": current_user.get("profile_image", "")
    }
    return user_profile

@app.put("/api/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    update_data = profile.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    users_collection.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

@app.get("/api/users")
async def get_users(skip: int = 0, limit: int = 20, country: Optional[str] = None, 
                   skill: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    # Build query
    query = {"user_id": {"$ne": current_user["user_id"]}}
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}
    
    # Get users
    users_cursor = users_collection.find(query).skip(skip).limit(limit)
    users = []
    
    for user in users_cursor:
        user_data = {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "country": user["country"],
            "age": user["age"],
            "bio": user.get("bio", ""),
            "skills": user.get("skills", []),
            "interests": user.get("interests", []),
            "education": user.get("education", ""),
            "goals": user.get("goals", ""),
            "current_projects": user.get("current_projects", ""),
            "languages": user.get("languages", []),
            "profile_image": user.get("profile_image", "")
        }
        users.append(user_data)
    
    return {"users": users}

@app.get("/api/user/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = {
        "user_id": user["user_id"],
        "full_name": user["full_name"],
        "country": user["country"],
        "age": user["age"],
        "bio": user.get("bio", ""),
        "skills": user.get("skills", []),
        "interests": user.get("interests", []),
        "education": user.get("education", ""),
        "goals": user.get("goals", ""),
        "current_projects": user.get("current_projects", ""),
        "languages": user.get("languages", []),
        "profile_image": user.get("profile_image", "")
    }
    
    return user_data

@app.post("/api/connect")
async def send_connection_request(connection: ConnectionRequest, current_user: dict = Depends(get_current_user)):
    # Check if connection already exists
    existing_connection = connections_collection.find_one({
        "$or": [
            {"requester_id": current_user["user_id"], "target_id": connection.target_user_id},
            {"requester_id": connection.target_user_id, "target_id": current_user["user_id"]}
        ]
    })
    
    if existing_connection:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    # Create connection request
    connection_doc = {
        "connection_id": str(uuid.uuid4()),
        "requester_id": current_user["user_id"],
        "target_id": connection.target_user_id,
        "message": connection.message,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    connections_collection.insert_one(connection_doc)
    return {"message": "Connection request sent"}

@app.get("/api/connections")
async def get_connections(current_user: dict = Depends(get_current_user)):
    # Get pending requests received
    pending_requests = list(connections_collection.find({
        "target_id": current_user["user_id"],
        "status": "pending"
    }))
    
    # Get accepted connections
    accepted_connections = list(connections_collection.find({
        "$or": [
            {"requester_id": current_user["user_id"], "status": "accepted"},
            {"target_id": current_user["user_id"], "status": "accepted"}
        ]
    }))
    
    # Populate user data
    for request in pending_requests:
        requester = users_collection.find_one({"user_id": request["requester_id"]})
        request["requester_name"] = requester["full_name"] if requester else "Unknown"
        request["requester_country"] = requester["country"] if requester else "Unknown"
    
    for connection in accepted_connections:
        # Determine the other user
        other_user_id = connection["target_id"] if connection["requester_id"] == current_user["user_id"] else connection["requester_id"]
        other_user = users_collection.find_one({"user_id": other_user_id})
        connection["other_user_name"] = other_user["full_name"] if other_user else "Unknown"
        connection["other_user_country"] = other_user["country"] if other_user else "Unknown"
        connection["other_user_id"] = other_user_id
    
    return {
        "pending_requests": pending_requests,
        "connections": accepted_connections
    }

@app.post("/api/connection/{connection_id}/accept")
async def accept_connection(connection_id: str, current_user: dict = Depends(get_current_user)):
    connection = connections_collection.find_one({"connection_id": connection_id})
    if not connection or connection["target_id"] != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    connections_collection.update_one(
        {"connection_id": connection_id},
        {"$set": {"status": "accepted", "accepted_at": datetime.utcnow()}}
    )
    
    return {"message": "Connection accepted"}

@app.post("/api/messages")
async def send_message(message: Message, current_user: dict = Depends(get_current_user)):
    # Check if users are connected
    connection = connections_collection.find_one({
        "$or": [
            {"requester_id": current_user["user_id"], "target_id": message.recipient_id, "status": "accepted"},
            {"requester_id": message.recipient_id, "target_id": current_user["user_id"], "status": "accepted"}
        ]
    })
    
    if not connection:
        raise HTTPException(status_code=403, detail="You can only message connected users")
    
    message_doc = {
        "message_id": str(uuid.uuid4()),
        "sender_id": current_user["user_id"],
        "recipient_id": message.recipient_id,
        "content": message.content,
        "created_at": datetime.utcnow(),
        "read": False
    }
    
    messages_collection.insert_one(message_doc)
    return {"message": "Message sent"}

@app.get("/api/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: dict = Depends(get_current_user)):
    # Get messages between current user and other user
    messages_cursor = messages_collection.find({
        "$or": [
            {"sender_id": current_user["user_id"], "recipient_id": other_user_id},
            {"sender_id": other_user_id, "recipient_id": current_user["user_id"]}
        ]
    }).sort("created_at", 1)
    
    messages = []
    for message in messages_cursor:
        message_data = {
            "message_id": message["message_id"],
            "sender_id": message["sender_id"],
            "recipient_id": message["recipient_id"],
            "content": message["content"],
            "created_at": message["created_at"],
            "read": message.get("read", False)
        }
        messages.append(message_data)
    
    return {"messages": messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)