from fastapi import FastAPI, HTTPException, Depends, status, Query
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
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AfriCore - Pan-African Youth Network, Employment & Funding Platform")

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
    organizations_collection = db.organizations
    jobs_collection = db.jobs
    applications_collection = db.applications
    endorsements_collection = db.endorsements
    projects_collection = db.projects
    contributions_collection = db.contributions
    project_updates_collection = db.project_updates
    project_comments_collection = db.project_comments
    policies_collection = db.policies
    policy_feedback_collection = db.policy_feedback
    policy_votes_collection = db.policy_votes
    civic_forums_collection = db.civic_forums
    forum_posts_collection = db.forum_posts
    civic_achievements_collection = db.civic_achievements
    participation_points_collection = db.participation_points
    courses_collection = db.courses
    course_modules_collection = db.course_modules
    course_lessons_collection = db.course_lessons
    enrollments_collection = db.enrollments
    certificates_collection = db.certificates
    mentorships_collection = db.mentorships
    learning_progress_collection = db.learning_progress
    course_reviews_collection = db.course_reviews
    skill_assessments_collection = db.skill_assessments
    logger.info("MongoDB connected successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Enums
class JobType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    INTERNSHIP = "internship"
    GIG_WORK = "gig_work"
    PROJECT = "project"
    VOLUNTEER = "volunteer"

class JobCategory(str, Enum):
    TECHNOLOGY = "technology"
    AGRICULTURE = "agriculture"
    EDUCATION = "education"
    HEALTH = "health"
    ENVIRONMENT = "environment"
    FINANCE = "finance"
    ARTS = "arts"
    BUSINESS = "business"
    ENGINEERING = "engineering"
    SOCIAL_WORK = "social_work"

class LocationType(str, Enum):
    REMOTE = "remote"
    ON_SITE = "on_site"
    HYBRID = "hybrid"

class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    INTERVIEWED = "interviewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class OrganizationType(str, Enum):
    STARTUP = "startup"
    NGO = "ngo"
    GOVERNMENT = "government"
    CORPORATION = "corporation"
    UNIVERSITY = "university"
    COOPERATIVE = "cooperative"

class ProjectCategory(str, Enum):
    EDUCATION = "education"
    TECHNOLOGY = "technology"
    AGRICULTURE = "agriculture"
    HEALTH = "health"
    ENVIRONMENT = "environment"
    ARTS_CULTURE = "arts_culture"
    SOCIAL_IMPACT = "social_impact"
    ENTREPRENEURSHIP = "entrepreneurship"
    INFRASTRUCTURE = "infrastructure"
    CLIMATE_ACTION = "climate_action"

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    FUNDED = "funded"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class FundingGoalType(str, Enum):
    FIXED = "fixed"
    FLEXIBLE = "flexible"

class PolicyCategory(str, Enum):
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    ECONOMY = "economy"
    ENVIRONMENT = "environment"
    YOUTH_DEVELOPMENT = "youth_development"
    INFRASTRUCTURE = "infrastructure"
    TECHNOLOGY = "technology"
    AGRICULTURE = "agriculture"
    GOVERNANCE = "governance"
    SOCIAL_JUSTICE = "social_justice"

class PolicyStatus(str, Enum):
    DRAFT = "draft"
    OPEN_FOR_FEEDBACK = "open_for_feedback"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    IMPLEMENTED = "implemented"
    REJECTED = "rejected"

class ProposalType(str, Enum):
    GOVERNMENT_POLICY = "government_policy"
    YOUTH_INITIATIVE = "youth_initiative"
    COMMUNITY_PROJECT = "community_project"
    POLICY_SUGGESTION = "policy_suggestion"

class VoteType(str, Enum):
    SUPPORT = "support"
    OPPOSE = "oppose"
    NEUTRAL = "neutral"

class ParticipationLevel(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class CourseCategory(str, Enum):
    TECHNOLOGY = "technology"
    BUSINESS = "business"
    DESIGN = "design"
    MARKETING = "marketing"
    AGRICULTURE = "agriculture"
    HEALTH = "health"
    EDUCATION = "education"
    ARTS = "arts"
    LANGUAGES = "languages"
    PERSONAL_DEVELOPMENT = "personal_development"

class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"

class CertificateType(str, Enum):
    COMPLETION = "completion"
    ACHIEVEMENT = "achievement"
    SKILL_BADGE = "skill_badge"
    MICRO_CREDENTIAL = "micro_credential"

class MentorshipStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

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
    work_experience: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    availability: Optional[str] = ""

class OrganizationProfile(BaseModel):
    name: str
    description: str
    organization_type: OrganizationType
    country: str
    website: Optional[str] = ""
    contact_email: EmailStr
    contact_phone: Optional[str] = ""
    size: Optional[str] = ""
    founded_year: Optional[int] = None

class JobPost(BaseModel):
    title: str
    description: str
    requirements: List[str]
    job_type: JobType
    job_category: JobCategory
    location_type: LocationType
    location: str
    salary_range: Optional[str] = ""
    deadline: Optional[datetime] = None
    skills_required: List[str]
    experience_level: Optional[str] = ""
    benefits: Optional[str] = ""

class JobApplication(BaseModel):
    job_id: str
    cover_letter: Optional[str] = ""
    portfolio_links: Optional[str] = ""

class ConnectionRequest(BaseModel):
    target_user_id: str
    message: Optional[str] = ""

class Message(BaseModel):
    recipient_id: str
    content: str

class SkillEndorsement(BaseModel):
    user_id: str
    skill: str
    endorsement_message: Optional[str] = ""

class ProjectProposal(BaseModel):
    title: str
    description: str
    category: ProjectCategory
    funding_goal: float
    funding_goal_type: FundingGoalType
    duration_months: int
    location: str
    impact_description: str
    budget_breakdown: str
    milestones: List[str]
    images: List[str] = []
    team_members: Optional[str] = ""
    risks_challenges: Optional[str] = ""
    sustainability_plan: Optional[str] = ""

class ProjectContribution(BaseModel):
    project_id: str
    amount: float
    anonymous: bool = False
    message: Optional[str] = ""

class ProjectUpdate(BaseModel):
    project_id: str
    title: str
    content: str
    images: List[str] = []
    milestone_completed: Optional[str] = None

class ProjectComment(BaseModel):
    project_id: str
    content: str
    reply_to: Optional[str] = None

class PolicyProposal(BaseModel):
    title: str
    description: str
    category: PolicyCategory
    proposal_type: ProposalType
    target_location: str
    expected_impact: str
    implementation_timeline: Optional[str] = ""
    resources_needed: Optional[str] = ""
    supporting_documents: List[str] = []

class PolicyFeedback(BaseModel):
    policy_id: str
    feedback_type: str  # "comment", "suggestion", "concern", "support"
    content: str
    impact_assessment: Optional[str] = ""
    alternative_suggestion: Optional[str] = ""

class PolicyVote(BaseModel):
    policy_id: str
    vote_type: VoteType
    comment: Optional[str] = ""

class ForumPost(BaseModel):
    forum_id: str
    title: str
    content: str
    tags: List[str] = []

class ForumReply(BaseModel):
    post_id: str
    content: str
    reply_to: Optional[str] = None

class CivicForum(BaseModel):
    title: str
    description: str
    category: PolicyCategory
    location: str
    moderators: List[str] = []

class Course(BaseModel):
    title: str
    description: str
    category: CourseCategory
    level: CourseLevel
    duration_hours: int
    price: float = 0.0  # 0 for free courses
    thumbnail_url: Optional[str] = ""
    learning_objectives: List[str]
    prerequisites: List[str] = []
    skills_gained: List[str] = []
    certificate_type: CertificateType = CertificateType.COMPLETION

class CourseModule(BaseModel):
    course_id: str
    title: str
    description: str
    order_index: int
    duration_minutes: int

class CourseLesson(BaseModel):
    module_id: str
    title: str
    description: str
    content: str
    lesson_type: str  # "video", "text", "assignment", "quiz"
    content_url: Optional[str] = ""
    order_index: int
    duration_minutes: int

class CourseEnrollment(BaseModel):
    course_id: str

class CourseReview(BaseModel):
    course_id: str
    rating: int  # 1-5 stars
    review_text: str

class MentorshipRequest(BaseModel):
    mentor_id: str
    skill_area: str
    goals: str
    duration_weeks: int
    message: str

class SkillAssessment(BaseModel):
    skill_name: str
    assessment_type: str  # "self_assessment", "peer_review", "test"
    score: int  # 1-100
    notes: Optional[str] = ""

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
        "work_experience": "",
        "portfolio_url": "",
        "availability": "",
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
        "work_experience": current_user.get("work_experience", ""),
        "portfolio_url": current_user.get("portfolio_url", ""),
        "availability": current_user.get("availability", ""),
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
            "work_experience": user.get("work_experience", ""),
            "portfolio_url": user.get("portfolio_url", ""),
            "availability": user.get("availability", ""),
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
        "work_experience": user.get("work_experience", ""),
        "portfolio_url": user.get("portfolio_url", ""),
        "availability": user.get("availability", ""),
        "profile_image": user.get("profile_image", "")
    }
    
    return user_data

# Connection endpoints (existing)
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

# Organization endpoints
@app.post("/api/organization/register")
async def register_organization(org: OrganizationProfile, current_user: dict = Depends(get_current_user)):
    # Check if organization already exists
    if organizations_collection.find_one({"name": org.name, "contact_email": org.contact_email}):
        raise HTTPException(status_code=400, detail="Organization already registered")
    
    org_id = str(uuid.uuid4())
    org_doc = {
        "organization_id": org_id,
        "owner_id": current_user["user_id"],
        "name": org.name,
        "description": org.description,
        "organization_type": org.organization_type,
        "country": org.country,
        "website": org.website,
        "contact_email": org.contact_email,
        "contact_phone": org.contact_phone,
        "size": org.size,
        "founded_year": org.founded_year,
        "verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    organizations_collection.insert_one(org_doc)
    return {"message": "Organization registered successfully", "organization_id": org_id}

@app.get("/api/organizations")
async def get_organizations(skip: int = 0, limit: int = 20, org_type: Optional[str] = None, 
                           country: Optional[str] = None):
    query = {}
    if org_type:
        query["organization_type"] = org_type
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    
    orgs_cursor = organizations_collection.find(query).skip(skip).limit(limit)
    organizations = []
    
    for org in orgs_cursor:
        org_data = {
            "organization_id": org["organization_id"],
            "name": org["name"],
            "description": org["description"],
            "organization_type": org["organization_type"],
            "country": org["country"],
            "website": org.get("website", ""),
            "size": org.get("size", ""),
            "founded_year": org.get("founded_year"),
            "verified": org.get("verified", False)
        }
        organizations.append(org_data)
    
    return {"organizations": organizations}

# Job endpoints
@app.post("/api/jobs")
async def create_job(job: JobPost, current_user: dict = Depends(get_current_user)):
    # Check if user has an organization
    org = organizations_collection.find_one({"owner_id": current_user["user_id"]})
    if not org:
        raise HTTPException(status_code=400, detail="You must register an organization first")
    
    job_id = str(uuid.uuid4())
    job_doc = {
        "job_id": job_id,
        "organization_id": org["organization_id"],
        "posted_by": current_user["user_id"],
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "job_type": job.job_type,
        "job_category": job.job_category,
        "location_type": job.location_type,
        "location": job.location,
        "salary_range": job.salary_range,
        "deadline": job.deadline,
        "skills_required": job.skills_required,
        "experience_level": job.experience_level,
        "benefits": job.benefits,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    jobs_collection.insert_one(job_doc)
    return {"message": "Job posted successfully", "job_id": job_id}

@app.get("/api/jobs")
async def get_jobs(skip: int = 0, limit: int = 20, job_type: Optional[str] = None,
                  job_category: Optional[str] = None, location: Optional[str] = None,
                  skills: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"active": True}
    if job_type:
        query["job_type"] = job_type
    if job_category:
        query["job_category"] = job_category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if skills:
        query["skills_required"] = {"$regex": skills, "$options": "i"}
    
    jobs_cursor = jobs_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    jobs = []
    
    for job in jobs_cursor:
        # Get organization info
        org = organizations_collection.find_one({"organization_id": job["organization_id"]})
        
        job_data = {
            "job_id": job["job_id"],
            "title": job["title"],
            "description": job["description"],
            "requirements": job["requirements"],
            "job_type": job["job_type"],
            "job_category": job["job_category"],
            "location_type": job["location_type"],
            "location": job["location"],
            "salary_range": job.get("salary_range", ""),
            "deadline": job.get("deadline"),
            "skills_required": job["skills_required"],
            "experience_level": job.get("experience_level", ""),
            "benefits": job.get("benefits", ""),
            "created_at": job["created_at"],
            "organization_name": org["name"] if org else "Unknown",
            "organization_type": org["organization_type"] if org else "Unknown"
        }
        jobs.append(job_data)
    
    return {"jobs": jobs}

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get organization info
    org = organizations_collection.find_one({"organization_id": job["organization_id"]})
    
    job_data = {
        "job_id": job["job_id"],
        "title": job["title"],
        "description": job["description"],
        "requirements": job["requirements"],
        "job_type": job["job_type"],
        "job_category": job["job_category"],
        "location_type": job["location_type"],
        "location": job["location"],
        "salary_range": job.get("salary_range", ""),
        "deadline": job.get("deadline"),
        "skills_required": job["skills_required"],
        "experience_level": job.get("experience_level", ""),
        "benefits": job.get("benefits", ""),
        "created_at": job["created_at"],
        "organization_name": org["name"] if org else "Unknown",
        "organization_type": org["organization_type"] if org else "Unknown",
        "organization_description": org["description"] if org else "",
        "organization_website": org.get("website", "") if org else ""
    }
    
    return job_data

@app.get("/api/jobs/recommended")
async def get_recommended_jobs(current_user: dict = Depends(get_current_user)):
    # Get user skills
    user_skills = current_user.get("skills", [])
    if not user_skills:
        return {"jobs": []}
    
    # Find jobs that match user skills
    jobs_cursor = jobs_collection.find({
        "active": True,
        "skills_required": {"$in": user_skills}
    }).sort("created_at", -1).limit(10)
    
    jobs = []
    for job in jobs_cursor:
        org = organizations_collection.find_one({"organization_id": job["organization_id"]})
        
        # Calculate match score
        matching_skills = set(user_skills) & set(job["skills_required"])
        match_score = len(matching_skills) / len(job["skills_required"]) * 100
        
        job_data = {
            "job_id": job["job_id"],
            "title": job["title"],
            "description": job["description"],
            "job_type": job["job_type"],
            "job_category": job["job_category"],
            "location": job["location"],
            "skills_required": job["skills_required"],
            "matching_skills": list(matching_skills),
            "match_score": round(match_score, 1),
            "organization_name": org["name"] if org else "Unknown",
            "created_at": job["created_at"]
        }
        jobs.append(job_data)
    
    # Sort by match score
    jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"jobs": jobs}

# Application endpoints
@app.post("/api/jobs/{job_id}/apply")
async def apply_job(job_id: str, application: JobApplication, current_user: dict = Depends(get_current_user)):
    # Check if job exists
    job = jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user already applied
    existing_application = applications_collection.find_one({
        "job_id": job_id,
        "applicant_id": current_user["user_id"]
    })
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    application_id = str(uuid.uuid4())
    application_doc = {
        "application_id": application_id,
        "job_id": job_id,
        "applicant_id": current_user["user_id"],
        "cover_letter": application.cover_letter,
        "portfolio_links": application.portfolio_links,
        "status": ApplicationStatus.APPLIED,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    applications_collection.insert_one(application_doc)
    return {"message": "Application submitted successfully", "application_id": application_id}

@app.get("/api/applications")
async def get_user_applications(current_user: dict = Depends(get_current_user)):
    applications_cursor = applications_collection.find({
        "applicant_id": current_user["user_id"]
    }).sort("created_at", -1)
    
    applications = []
    for app in applications_cursor:
        # Get job info
        job = jobs_collection.find_one({"job_id": app["job_id"]})
        org = organizations_collection.find_one({"organization_id": job["organization_id"]}) if job else None
        
        app_data = {
            "application_id": app["application_id"],
            "job_id": app["job_id"],
            "job_title": job["title"] if job else "Unknown",
            "organization_name": org["name"] if org else "Unknown",
            "status": app["status"],
            "applied_at": app["created_at"],
            "cover_letter": app.get("cover_letter", ""),
            "portfolio_links": app.get("portfolio_links", "")
        }
        applications.append(app_data)
    
    return {"applications": applications}

@app.get("/api/organization/applications")
async def get_organization_applications(current_user: dict = Depends(get_current_user)):
    # Get user's organization
    org = organizations_collection.find_one({"owner_id": current_user["user_id"]})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get all jobs for this organization
    jobs_cursor = jobs_collection.find({"organization_id": org["organization_id"]})
    job_ids = [job["job_id"] for job in jobs_cursor]
    
    # Get applications for these jobs
    applications_cursor = applications_collection.find({
        "job_id": {"$in": job_ids}
    }).sort("created_at", -1)
    
    applications = []
    for app in applications_cursor:
        # Get applicant info
        applicant = users_collection.find_one({"user_id": app["applicant_id"]})
        job = jobs_collection.find_one({"job_id": app["job_id"]})
        
        app_data = {
            "application_id": app["application_id"],
            "job_id": app["job_id"],
            "job_title": job["title"] if job else "Unknown",
            "applicant_name": applicant["full_name"] if applicant else "Unknown",
            "applicant_email": applicant["email"] if applicant else "Unknown",
            "applicant_country": applicant["country"] if applicant else "Unknown",
            "applicant_skills": applicant.get("skills", []) if applicant else [],
            "status": app["status"],
            "applied_at": app["created_at"],
            "cover_letter": app.get("cover_letter", ""),
            "portfolio_links": app.get("portfolio_links", "")
        }
        applications.append(app_data)
    
    return {"applications": applications}

@app.put("/api/applications/{application_id}/status")
async def update_application_status(application_id: str, status: ApplicationStatus, current_user: dict = Depends(get_current_user)):
    # Get application
    application = applications_collection.find_one({"application_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if user owns the organization that posted the job
    job = jobs_collection.find_one({"job_id": application["job_id"]})
    org = organizations_collection.find_one({"organization_id": job["organization_id"]})
    
    if org["owner_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    applications_collection.update_one(
        {"application_id": application_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Application status updated successfully"}

# Skill endorsement endpoints
@app.post("/api/endorse")
async def endorse_skill(endorsement: SkillEndorsement, current_user: dict = Depends(get_current_user)):
    # Check if users are connected
    connection = connections_collection.find_one({
        "$or": [
            {"requester_id": current_user["user_id"], "target_id": endorsement.user_id, "status": "accepted"},
            {"requester_id": endorsement.user_id, "target_id": current_user["user_id"], "status": "accepted"}
        ]
    })
    
    if not connection:
        raise HTTPException(status_code=403, detail="You can only endorse skills of connected users")
    
    # Check if already endorsed
    existing_endorsement = endorsements_collection.find_one({
        "endorser_id": current_user["user_id"],
        "user_id": endorsement.user_id,
        "skill": endorsement.skill
    })
    
    if existing_endorsement:
        raise HTTPException(status_code=400, detail="You have already endorsed this skill")
    
    endorsement_id = str(uuid.uuid4())
    endorsement_doc = {
        "endorsement_id": endorsement_id,
        "endorser_id": current_user["user_id"],
        "user_id": endorsement.user_id,
        "skill": endorsement.skill,
        "endorsement_message": endorsement.endorsement_message,
        "created_at": datetime.utcnow()
    }
    
    endorsements_collection.insert_one(endorsement_doc)
    return {"message": "Skill endorsed successfully"}

@app.get("/api/endorsements/{user_id}")
async def get_user_endorsements(user_id: str):
    endorsements_cursor = endorsements_collection.find({"user_id": user_id})
    endorsements = []
    
    for endorsement in endorsements_cursor:
        endorser = users_collection.find_one({"user_id": endorsement["endorser_id"]})
        endorsement_data = {
            "endorsement_id": endorsement["endorsement_id"],
            "skill": endorsement["skill"],
            "endorsement_message": endorsement.get("endorsement_message", ""),
            "endorser_name": endorser["full_name"] if endorser else "Unknown",
            "endorser_country": endorser["country"] if endorser else "Unknown",
            "created_at": endorsement["created_at"]
        }
        endorsements.append(endorsement_data)
    
    return {"endorsements": endorsements}

# Project endpoints
@app.post("/api/projects")
async def create_project(project: ProjectProposal, current_user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    project_doc = {
        "project_id": project_id,
        "creator_id": current_user["user_id"],
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "funding_goal": project.funding_goal,
        "funding_goal_type": project.funding_goal_type,
        "current_funding": 0.0,
        "funding_percentage": 0.0,
        "contributor_count": 0,
        "duration_months": project.duration_months,
        "location": project.location,
        "impact_description": project.impact_description,
        "budget_breakdown": project.budget_breakdown,
        "milestones": project.milestones,
        "completed_milestones": [],
        "images": project.images,
        "team_members": project.team_members,
        "risks_challenges": project.risks_challenges,
        "sustainability_plan": project.sustainability_plan,
        "status": ProjectStatus.PENDING_APPROVAL,
        "featured": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "deadline": datetime.utcnow() + timedelta(days=90)  # 90 days funding period
    }
    
    projects_collection.insert_one(project_doc)
    return {"message": "Project proposal submitted successfully", "project_id": project_id}

@app.get("/api/projects")
async def get_projects(skip: int = 0, limit: int = 20, category: Optional[str] = None,
                      status: Optional[str] = None, featured: Optional[bool] = None,
                      location: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    else:
        query["status"] = {"$in": ["active", "funded", "in_progress", "completed"]}
    if featured is not None:
        query["featured"] = featured
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    projects_cursor = projects_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    projects = []
    
    for project in projects_cursor:
        # Get creator info
        creator = users_collection.find_one({"user_id": project["creator_id"]})
        
        project_data = {
            "project_id": project["project_id"],
            "title": project["title"],
            "description": project["description"],
            "category": project["category"],
            "funding_goal": project["funding_goal"],
            "current_funding": project.get("current_funding", 0.0),
            "funding_percentage": project.get("funding_percentage", 0.0),
            "contributor_count": project.get("contributor_count", 0),
            "duration_months": project["duration_months"],
            "location": project["location"],
            "impact_description": project["impact_description"],
            "images": project.get("images", []),
            "status": project["status"],
            "featured": project.get("featured", False),
            "created_at": project["created_at"],
            "deadline": project.get("deadline"),
            "creator_name": creator["full_name"] if creator else "Unknown",
            "creator_country": creator["country"] if creator else "Unknown",
            "days_left": (project.get("deadline") - datetime.utcnow()).days if project.get("deadline") else 0
        }
        projects.append(project_data)
    
    return {"projects": projects}

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = projects_collection.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get creator info
    creator = users_collection.find_one({"user_id": project["creator_id"]})
    
    # Get recent contributions
    recent_contributions = list(contributions_collection.find({
        "project_id": project_id,
        "anonymous": False
    }).sort("created_at", -1).limit(10))
    
    for contribution in recent_contributions:
        contributor = users_collection.find_one({"user_id": contribution["contributor_id"]})
        contribution["contributor_name"] = contributor["full_name"] if contributor else "Anonymous"
        contribution["contributor_country"] = contributor["country"] if contributor else ""
    
    # Get project updates
    updates = list(project_updates_collection.find({
        "project_id": project_id
    }).sort("created_at", -1))
    
    project_data = {
        "project_id": project["project_id"],
        "title": project["title"],
        "description": project["description"],
        "category": project["category"],
        "funding_goal": project["funding_goal"],
        "funding_goal_type": project["funding_goal_type"],
        "current_funding": project.get("current_funding", 0.0),
        "funding_percentage": project.get("funding_percentage", 0.0),
        "contributor_count": project.get("contributor_count", 0),
        "duration_months": project["duration_months"],
        "location": project["location"],
        "impact_description": project["impact_description"],
        "budget_breakdown": project["budget_breakdown"],
        "milestones": project["milestones"],
        "completed_milestones": project.get("completed_milestones", []),
        "images": project.get("images", []),
        "team_members": project.get("team_members", ""),
        "risks_challenges": project.get("risks_challenges", ""),
        "sustainability_plan": project.get("sustainability_plan", ""),
        "status": project["status"],
        "featured": project.get("featured", False),
        "created_at": project["created_at"],
        "deadline": project.get("deadline"),
        "creator_id": project["creator_id"],
        "creator_name": creator["full_name"] if creator else "Unknown",
        "creator_country": creator["country"] if creator else "Unknown",
        "creator_bio": creator.get("bio", "") if creator else "",
        "days_left": (project.get("deadline") - datetime.utcnow()).days if project.get("deadline") else 0,
        "recent_contributions": recent_contributions,
        "updates": updates
    }
    
    return project_data

@app.get("/api/projects/my")
async def get_my_projects(current_user: dict = Depends(get_current_user)):
    projects_cursor = projects_collection.find({
        "creator_id": current_user["user_id"]
    }).sort("created_at", -1)
    
    projects = []
    for project in projects_cursor:
        project_data = {
            "project_id": project["project_id"],
            "title": project["title"],
            "category": project["category"],
            "funding_goal": project["funding_goal"],
            "current_funding": project.get("current_funding", 0.0),
            "funding_percentage": project.get("funding_percentage", 0.0),
            "contributor_count": project.get("contributor_count", 0),
            "status": project["status"],
            "created_at": project["created_at"],
            "deadline": project.get("deadline"),
            "days_left": (project.get("deadline") - datetime.utcnow()).days if project.get("deadline") else 0
        }
        projects.append(project_data)
    
    return {"projects": projects}

@app.post("/api/projects/{project_id}/contribute")
async def contribute_to_project(project_id: str, contribution: ProjectContribution, current_user: dict = Depends(get_current_user)):
    # Get project
    project = projects_collection.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] not in ["active", "funded"]:
        raise HTTPException(status_code=400, detail="Project is not accepting contributions")
    
    # Create contribution record
    contribution_id = str(uuid.uuid4())
    contribution_doc = {
        "contribution_id": contribution_id,
        "project_id": project_id,
        "contributor_id": current_user["user_id"],
        "amount": contribution.amount,
        "anonymous": contribution.anonymous,
        "message": contribution.message,
        "created_at": datetime.utcnow()
    }
    
    contributions_collection.insert_one(contribution_doc)
    
    # Update project funding
    new_funding = project.get("current_funding", 0.0) + contribution.amount
    new_percentage = (new_funding / project["funding_goal"]) * 100
    new_contributor_count = project.get("contributor_count", 0) + 1
    
    # Update project status if funding goal reached
    new_status = project["status"]
    if project["funding_goal_type"] == "fixed" and new_funding >= project["funding_goal"]:
        new_status = "funded"
    
    projects_collection.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "current_funding": new_funding,
                "funding_percentage": new_percentage,
                "contributor_count": new_contributor_count,
                "status": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Contribution successful", "contribution_id": contribution_id}

@app.get("/api/contributions/my")
async def get_my_contributions(current_user: dict = Depends(get_current_user)):
    contributions_cursor = contributions_collection.find({
        "contributor_id": current_user["user_id"]
    }).sort("created_at", -1)
    
    contributions = []
    for contribution in contributions_cursor:
        # Get project info
        project = projects_collection.find_one({"project_id": contribution["project_id"]})
        
        contribution_data = {
            "contribution_id": contribution["contribution_id"],
            "project_id": contribution["project_id"],
            "project_title": project["title"] if project else "Unknown",
            "project_status": project["status"] if project else "Unknown",
            "amount": contribution["amount"],
            "message": contribution.get("message", ""),
            "created_at": contribution["created_at"]
        }
        contributions.append(contribution_data)
    
    return {"contributions": contributions}

@app.post("/api/projects/{project_id}/updates")
async def add_project_update(project_id: str, update: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    # Check if user owns the project
    project = projects_collection.find_one({"project_id": project_id})
    if not project or project["creator_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    update_id = str(uuid.uuid4())
    update_doc = {
        "update_id": update_id,
        "project_id": project_id,
        "title": update.title,
        "content": update.content,
        "images": update.images,
        "milestone_completed": update.milestone_completed,
        "created_at": datetime.utcnow()
    }
    
    project_updates_collection.insert_one(update_doc)
    
    # Update completed milestones if specified
    if update.milestone_completed:
        completed_milestones = project.get("completed_milestones", [])
        if update.milestone_completed not in completed_milestones:
            completed_milestones.append(update.milestone_completed)
            projects_collection.update_one(
                {"project_id": project_id},
                {"$set": {"completed_milestones": completed_milestones, "updated_at": datetime.utcnow()}}
            )
    
    return {"message": "Project update added successfully", "update_id": update_id}

@app.post("/api/projects/{project_id}/comments")
async def add_project_comment(project_id: str, comment: ProjectComment, current_user: dict = Depends(get_current_user)):
    # Check if project exists
    project = projects_collection.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    comment_id = str(uuid.uuid4())
    comment_doc = {
        "comment_id": comment_id,
        "project_id": project_id,
        "commenter_id": current_user["user_id"],
        "content": comment.content,
        "reply_to": comment.reply_to,
        "created_at": datetime.utcnow()
    }
    
    project_comments_collection.insert_one(comment_doc)
    return {"message": "Comment added successfully", "comment_id": comment_id}

@app.get("/api/projects/{project_id}/comments")
async def get_project_comments(project_id: str, current_user: dict = Depends(get_current_user)):
    comments_cursor = project_comments_collection.find({
        "project_id": project_id
    }).sort("created_at", 1)
    
    comments = []
    for comment in comments_cursor:
        commenter = users_collection.find_one({"user_id": comment["commenter_id"]})
        comment_data = {
            "comment_id": comment["comment_id"],
            "content": comment["content"],
            "reply_to": comment.get("reply_to"),
            "created_at": comment["created_at"],
            "commenter_name": commenter["full_name"] if commenter else "Unknown",
            "commenter_country": commenter["country"] if commenter else "Unknown"
        }
        comments.append(comment_data)
    
    return {"comments": comments}

# Civic Engagement Endpoints
@app.post("/api/policies")
async def create_policy(policy: PolicyProposal, current_user: dict = Depends(get_current_user)):
    policy_id = str(uuid.uuid4())
    policy_doc = {
        "policy_id": policy_id,
        "creator_id": current_user["user_id"],
        "title": policy.title,
        "description": policy.description,
        "category": policy.category,
        "proposal_type": policy.proposal_type,
        "target_location": policy.target_location,
        "expected_impact": policy.expected_impact,
        "implementation_timeline": policy.implementation_timeline,
        "resources_needed": policy.resources_needed,
        "supporting_documents": policy.supporting_documents,
        "status": PolicyStatus.OPEN_FOR_FEEDBACK,
        "support_votes": 0,
        "oppose_votes": 0,
        "neutral_votes": 0,
        "feedback_count": 0,
        "engagement_score": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "feedback_deadline": datetime.utcnow() + timedelta(days=30)  # 30 days for feedback
    }
    
    policies_collection.insert_one(policy_doc)
    
    # Award participation points
    await award_participation_points(current_user["user_id"], "policy_creation", 50)
    
    return {"message": "Policy proposal submitted successfully", "policy_id": policy_id}

@app.get("/api/policies")
async def get_policies(skip: int = 0, limit: int = 20, category: Optional[str] = None,
                      status: Optional[str] = None, location: Optional[str] = None,
                      current_user: dict = Depends(get_current_user)):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    else:
        query["status"] = {"$in": ["open_for_feedback", "under_review", "approved", "implemented"]}
    if location:
        query["target_location"] = {"$regex": location, "$options": "i"}
    
    policies_cursor = policies_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    policies = []
    
    for policy in policies_cursor:
        # Get creator info
        creator = users_collection.find_one({"user_id": policy["creator_id"]})
        
        # Check if current user has voted
        user_vote = policy_votes_collection.find_one({
            "policy_id": policy["policy_id"],
            "voter_id": current_user["user_id"]
        })
        
        policy_data = {
            "policy_id": policy["policy_id"],
            "title": policy["title"],
            "description": policy["description"],
            "category": policy["category"],
            "proposal_type": policy["proposal_type"],
            "target_location": policy["target_location"],
            "expected_impact": policy["expected_impact"],
            "status": policy["status"],
            "support_votes": policy.get("support_votes", 0),
            "oppose_votes": policy.get("oppose_votes", 0),
            "neutral_votes": policy.get("neutral_votes", 0),
            "feedback_count": policy.get("feedback_count", 0),
            "engagement_score": policy.get("engagement_score", 0),
            "created_at": policy["created_at"],
            "feedback_deadline": policy.get("feedback_deadline"),
            "creator_name": creator["full_name"] if creator else "Unknown",
            "creator_country": creator["country"] if creator else "Unknown",
            "user_vote": user_vote["vote_type"] if user_vote else None,
            "days_left": (policy.get("feedback_deadline") - datetime.utcnow()).days if policy.get("feedback_deadline") else 0
        }
        policies.append(policy_data)
    
    return {"policies": policies}

@app.get("/api/policies/{policy_id}")
async def get_policy(policy_id: str, current_user: dict = Depends(get_current_user)):
    policy = policies_collection.find_one({"policy_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Get creator info
    creator = users_collection.find_one({"user_id": policy["creator_id"]})
    
    # Get recent feedback
    recent_feedback = list(policy_feedback_collection.find({
        "policy_id": policy_id
    }).sort("created_at", -1).limit(10))
    
    for feedback in recent_feedback:
        feedback_giver = users_collection.find_one({"user_id": feedback["feedback_giver_id"]})
        feedback["feedback_giver_name"] = feedback_giver["full_name"] if feedback_giver else "Anonymous"
        feedback["feedback_giver_country"] = feedback_giver["country"] if feedback_giver else ""
    
    # Check if current user has voted
    user_vote = policy_votes_collection.find_one({
        "policy_id": policy_id,
        "voter_id": current_user["user_id"]
    })
    
    policy_data = {
        "policy_id": policy["policy_id"],
        "title": policy["title"],
        "description": policy["description"],
        "category": policy["category"],
        "proposal_type": policy["proposal_type"],
        "target_location": policy["target_location"],
        "expected_impact": policy["expected_impact"],
        "implementation_timeline": policy.get("implementation_timeline", ""),
        "resources_needed": policy.get("resources_needed", ""),
        "supporting_documents": policy.get("supporting_documents", []),
        "status": policy["status"],
        "support_votes": policy.get("support_votes", 0),
        "oppose_votes": policy.get("oppose_votes", 0),
        "neutral_votes": policy.get("neutral_votes", 0),
        "feedback_count": policy.get("feedback_count", 0),
        "engagement_score": policy.get("engagement_score", 0),
        "created_at": policy["created_at"],
        "feedback_deadline": policy.get("feedback_deadline"),
        "creator_id": policy["creator_id"],
        "creator_name": creator["full_name"] if creator else "Unknown",
        "creator_country": creator["country"] if creator else "Unknown",
        "creator_bio": creator.get("bio", "") if creator else "",
        "user_vote": user_vote["vote_type"] if user_vote else None,
        "days_left": (policy.get("feedback_deadline") - datetime.utcnow()).days if policy.get("feedback_deadline") else 0,
        "recent_feedback": recent_feedback
    }
    
    return policy_data

@app.post("/api/policies/{policy_id}/vote")
async def vote_on_policy(policy_id: str, vote: PolicyVote, current_user: dict = Depends(get_current_user)):
    # Check if policy exists
    policy = policies_collection.find_one({"policy_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    if policy["status"] not in ["open_for_feedback", "under_review"]:
        raise HTTPException(status_code=400, detail="Policy is not accepting votes")
    
    # Check if user has already voted
    existing_vote = policy_votes_collection.find_one({
        "policy_id": policy_id,
        "voter_id": current_user["user_id"]
    })
    
    if existing_vote:
        # Update existing vote
        old_vote = existing_vote["vote_type"]
        policy_votes_collection.update_one(
            {"vote_id": existing_vote["vote_id"]},
            {
                "$set": {
                    "vote_type": vote.vote_type,
                    "comment": vote.comment,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update policy vote counts
        policies_collection.update_one(
            {"policy_id": policy_id},
            {
                "$inc": {
                    f"{old_vote}_votes": -1,
                    f"{vote.vote_type}_votes": 1
                }
            }
        )
    else:
        # Create new vote
        vote_id = str(uuid.uuid4())
        vote_doc = {
            "vote_id": vote_id,
            "policy_id": policy_id,
            "voter_id": current_user["user_id"],
            "vote_type": vote.vote_type,
            "comment": vote.comment,
            "created_at": datetime.utcnow()
        }
        
        policy_votes_collection.insert_one(vote_doc)
        
        # Update policy vote counts
        policies_collection.update_one(
            {"policy_id": policy_id},
            {"$inc": {f"{vote.vote_type}_votes": 1}}
        )
    
    # Award participation points
    await award_participation_points(current_user["user_id"], "policy_vote", 10)
    
    return {"message": "Vote recorded successfully"}

@app.post("/api/policies/{policy_id}/feedback")
async def give_policy_feedback(policy_id: str, feedback: PolicyFeedback, current_user: dict = Depends(get_current_user)):
    # Check if policy exists
    policy = policies_collection.find_one({"policy_id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    if policy["status"] not in ["open_for_feedback", "under_review"]:
        raise HTTPException(status_code=400, detail="Policy is not accepting feedback")
    
    feedback_id = str(uuid.uuid4())
    feedback_doc = {
        "feedback_id": feedback_id,
        "policy_id": policy_id,
        "feedback_giver_id": current_user["user_id"],
        "feedback_type": feedback.feedback_type,
        "content": feedback.content,
        "impact_assessment": feedback.impact_assessment,
        "alternative_suggestion": feedback.alternative_suggestion,
        "helpful_votes": 0,
        "created_at": datetime.utcnow()
    }
    
    policy_feedback_collection.insert_one(feedback_doc)
    
    # Update policy feedback count
    policies_collection.update_one(
        {"policy_id": policy_id},
        {"$inc": {"feedback_count": 1}}
    )
    
    # Award participation points
    await award_participation_points(current_user["user_id"], "policy_feedback", 25)
    
    return {"message": "Feedback submitted successfully", "feedback_id": feedback_id}

@app.get("/api/policies/{policy_id}/feedback")
async def get_policy_feedback(policy_id: str, current_user: dict = Depends(get_current_user)):
    feedback_cursor = policy_feedback_collection.find({
        "policy_id": policy_id
    }).sort("created_at", -1)
    
    feedback_list = []
    for feedback in feedback_cursor:
        feedback_giver = users_collection.find_one({"user_id": feedback["feedback_giver_id"]})
        feedback_data = {
            "feedback_id": feedback["feedback_id"],
            "feedback_type": feedback["feedback_type"],
            "content": feedback["content"],
            "impact_assessment": feedback.get("impact_assessment", ""),
            "alternative_suggestion": feedback.get("alternative_suggestion", ""),
            "helpful_votes": feedback.get("helpful_votes", 0),
            "created_at": feedback["created_at"],
            "feedback_giver_name": feedback_giver["full_name"] if feedback_giver else "Anonymous",
            "feedback_giver_country": feedback_giver["country"] if feedback_giver else ""
        }
        feedback_list.append(feedback_data)
    
    return {"feedback": feedback_list}

@app.get("/api/civic/my-participation")
async def get_my_civic_participation(current_user: dict = Depends(get_current_user)):
    # Get user's participation points
    points_doc = participation_points_collection.find_one({"user_id": current_user["user_id"]})
    total_points = points_doc.get("total_points", 0) if points_doc else 0
    
    # Get user's policies
    my_policies = list(policies_collection.find({"creator_id": current_user["user_id"]}))
    
    # Get user's votes
    my_votes = list(policy_votes_collection.find({"voter_id": current_user["user_id"]}))
    
    # Get user's feedback
    my_feedback = list(policy_feedback_collection.find({"feedback_giver_id": current_user["user_id"]}))
    
    # Calculate participation level
    participation_level = "bronze"
    if total_points >= 1000:
        participation_level = "platinum"
    elif total_points >= 500:
        participation_level = "gold"
    elif total_points >= 200:
        participation_level = "silver"
    
    participation_data = {
        "total_points": total_points,
        "participation_level": participation_level,
        "policies_created": len(my_policies),
        "votes_cast": len(my_votes),
        "feedback_given": len(my_feedback),
        "recent_policies": [
            {
                "policy_id": policy["policy_id"],
                "title": policy["title"],
                "status": policy["status"],
                "support_votes": policy.get("support_votes", 0),
                "oppose_votes": policy.get("oppose_votes", 0),
                "created_at": policy["created_at"]
            } for policy in my_policies[:5]
        ]
    }
    
    return participation_data

@app.get("/api/civic/leaderboard")
async def get_civic_leaderboard(limit: int = 10, current_user: dict = Depends(get_current_user)):
    # Get top participants by points
    leaderboard_cursor = participation_points_collection.find().sort("total_points", -1).limit(limit)
    
    leaderboard = []
    rank = 1
    for participant in leaderboard_cursor:
        user = users_collection.find_one({"user_id": participant["user_id"]})
        if user:
            leaderboard_data = {
                "rank": rank,
                "user_id": participant["user_id"],
                "user_name": user["full_name"],
                "user_country": user["country"],
                "total_points": participant["total_points"],
                "participation_level": participant.get("participation_level", "bronze"),
                "policies_created": participant.get("policies_created", 0),
                "votes_cast": participant.get("votes_cast", 0),
                "feedback_given": participant.get("feedback_given", 0)
            }
            leaderboard.append(leaderboard_data)
            rank += 1
    
    return {"leaderboard": leaderboard}

# Civic Forums Endpoints
@app.post("/api/civic-forums")
async def create_civic_forum(forum: CivicForum, current_user: dict = Depends(get_current_user)):
    forum_id = str(uuid.uuid4())
    forum_doc = {
        "forum_id": forum_id,
        "creator_id": current_user["user_id"],
        "title": forum.title,
        "description": forum.description,
        "category": forum.category,
        "location": forum.location,
        "moderators": [current_user["user_id"]] + forum.moderators,
        "post_count": 0,
        "member_count": 1,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    civic_forums_collection.insert_one(forum_doc)
    
    # Award participation points
    await award_participation_points(current_user["user_id"], "forum_creation", 30)
    
    return {"message": "Civic forum created successfully", "forum_id": forum_id}

@app.get("/api/civic-forums")
async def get_civic_forums(skip: int = 0, limit: int = 20, category: Optional[str] = None,
                          location: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"active": True}
    if category:
        query["category"] = category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    forums_cursor = civic_forums_collection.find(query).skip(skip).limit(limit).sort("updated_at", -1)
    forums = []
    
    for forum in forums_cursor:
        creator = users_collection.find_one({"user_id": forum["creator_id"]})
        forum_data = {
            "forum_id": forum["forum_id"],
            "title": forum["title"],
            "description": forum["description"],
            "category": forum["category"],
            "location": forum["location"],
            "post_count": forum.get("post_count", 0),
            "member_count": forum.get("member_count", 0),
            "created_at": forum["created_at"],
            "updated_at": forum["updated_at"],
            "creator_name": creator["full_name"] if creator else "Unknown"
        }
        forums.append(forum_data)
    
    return {"forums": forums}

# Helper function for awarding participation points
async def award_participation_points(user_id: str, activity_type: str, points: int):
    # Update or create participation points record
    participation_points_collection.update_one(
        {"user_id": user_id},
        {
            "$inc": {"total_points": points},
            "$set": {"updated_at": datetime.utcnow()},
            "$setOnInsert": {"user_id": user_id, "created_at": datetime.utcnow()}
        },
        upsert=True
    )
    
    # Update activity-specific counters
    if activity_type == "policy_creation":
        participation_points_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"policies_created": 1}}
        )
    elif activity_type == "policy_vote":
        participation_points_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"votes_cast": 1}}
        )
    elif activity_type == "policy_feedback":
        participation_points_collection.update_one(
            {"user_id": user_id},
            {"$inc": {"feedback_given": 1}}
        )

# Educational Platform Endpoints
@app.post("/api/courses")
async def create_course(course: Course, current_user: dict = Depends(get_current_user)):
    course_id = str(uuid.uuid4())
    course_doc = {
        "course_id": course_id,
        "instructor_id": current_user["user_id"],
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "level": course.level,
        "duration_hours": course.duration_hours,
        "price": course.price,
        "thumbnail_url": course.thumbnail_url,
        "learning_objectives": course.learning_objectives,
        "prerequisites": course.prerequisites,
        "skills_gained": course.skills_gained,
        "certificate_type": course.certificate_type,
        "status": CourseStatus.DRAFT,
        "enrollment_count": 0,
        "average_rating": 0.0,
        "review_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    courses_collection.insert_one(course_doc)
    return {"message": "Course created successfully", "course_id": course_id}

@app.get("/api/courses")
async def get_courses(skip: int = 0, limit: int = 20, category: Optional[str] = None,
                     level: Optional[str] = None, free_only: Optional[bool] = None,
                     current_user: dict = Depends(get_current_user)):
    query = {"status": CourseStatus.PUBLISHED}
    if category:
        query["category"] = category
    if level:
        query["level"] = level
    if free_only:
        query["price"] = 0.0
    
    courses_cursor = courses_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    courses = []
    
    for course in courses_cursor:
        # Get instructor info
        instructor = users_collection.find_one({"user_id": course["instructor_id"]})
        
        # Check if current user is enrolled
        enrollment = enrollments_collection.find_one({
            "course_id": course["course_id"],
            "student_id": current_user["user_id"]
        })
        
        course_data = {
            "course_id": course["course_id"],
            "title": course["title"],
            "description": course["description"],
            "category": course["category"],
            "level": course["level"],
            "duration_hours": course["duration_hours"],
            "price": course["price"],
            "thumbnail_url": course.get("thumbnail_url", ""),
            "learning_objectives": course["learning_objectives"],
            "skills_gained": course["skills_gained"],
            "enrollment_count": course.get("enrollment_count", 0),
            "average_rating": course.get("average_rating", 0.0),
            "review_count": course.get("review_count", 0),
            "created_at": course["created_at"],
            "instructor_name": instructor["full_name"] if instructor else "Unknown",
            "instructor_country": instructor["country"] if instructor else "Unknown",
            "is_enrolled": bool(enrollment),
            "enrollment_status": enrollment.get("status") if enrollment else None
        }
        courses.append(course_data)
    
    return {"courses": courses}

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = courses_collection.find_one({"course_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get instructor info
    instructor = users_collection.find_one({"user_id": course["instructor_id"]})
    
    # Get course modules
    modules = list(course_modules_collection.find({
        "course_id": course_id
    }).sort("order_index", 1))
    
    for module in modules:
        # Get lessons for each module
        lessons = list(course_lessons_collection.find({
            "module_id": module["module_id"]
        }).sort("order_index", 1))
        module["lessons"] = lessons
    
    # Check if current user is enrolled
    enrollment = enrollments_collection.find_one({
        "course_id": course_id,
        "student_id": current_user["user_id"]
    })
    
    # Get recent reviews
    reviews = list(course_reviews_collection.find({
        "course_id": course_id
    }).sort("created_at", -1).limit(5))
    
    for review in reviews:
        reviewer = users_collection.find_one({"user_id": review["reviewer_id"]})
        review["reviewer_name"] = reviewer["full_name"] if reviewer else "Anonymous"
        review["reviewer_country"] = reviewer["country"] if reviewer else ""
    
    course_data = {
        "course_id": course["course_id"],
        "title": course["title"],
        "description": course["description"],
        "category": course["category"],
        "level": course["level"],
        "duration_hours": course["duration_hours"],
        "price": course["price"],
        "thumbnail_url": course.get("thumbnail_url", ""),
        "learning_objectives": course["learning_objectives"],
        "prerequisites": course.get("prerequisites", []),
        "skills_gained": course["skills_gained"],
        "certificate_type": course["certificate_type"],
        "enrollment_count": course.get("enrollment_count", 0),
        "average_rating": course.get("average_rating", 0.0),
        "review_count": course.get("review_count", 0),
        "created_at": course["created_at"],
        "instructor_id": course["instructor_id"],
        "instructor_name": instructor["full_name"] if instructor else "Unknown",
        "instructor_country": instructor["country"] if instructor else "Unknown",
        "instructor_bio": instructor.get("bio", "") if instructor else "",
        "is_enrolled": bool(enrollment),
        "enrollment_status": enrollment.get("status") if enrollment else None,
        "progress_percentage": enrollment.get("progress_percentage", 0) if enrollment else 0,
        "modules": modules,
        "recent_reviews": reviews
    }
    
    return course_data

@app.post("/api/courses/{course_id}/enroll")
async def enroll_in_course(course_id: str, current_user: dict = Depends(get_current_user)):
    # Check if course exists
    course = courses_collection.find_one({"course_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing_enrollment = enrollments_collection.find_one({
        "course_id": course_id,
        "student_id": current_user["user_id"]
    })
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment
    enrollment_id = str(uuid.uuid4())
    enrollment_doc = {
        "enrollment_id": enrollment_id,
        "course_id": course_id,
        "student_id": current_user["user_id"],
        "status": EnrollmentStatus.ACTIVE,
        "progress_percentage": 0,
        "enrolled_at": datetime.utcnow(),
        "last_accessed": datetime.utcnow()
    }
    
    enrollments_collection.insert_one(enrollment_doc)
    
    # Update course enrollment count
    courses_collection.update_one(
        {"course_id": course_id},
        {"$inc": {"enrollment_count": 1}}
    )
    
    return {"message": "Successfully enrolled in course", "enrollment_id": enrollment_id}

@app.get("/api/courses/my-courses")
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    # Get user's enrollments
    enrollments_cursor = enrollments_collection.find({
        "student_id": current_user["user_id"]
    }).sort("enrolled_at", -1)
    
    courses = []
    for enrollment in enrollments_cursor:
        # Get course info
        course = courses_collection.find_one({"course_id": enrollment["course_id"]})
        if course:
            instructor = users_collection.find_one({"user_id": course["instructor_id"]})
            
            course_data = {
                "course_id": course["course_id"],
                "title": course["title"],
                "category": course["category"],
                "level": course["level"],
                "duration_hours": course["duration_hours"],
                "thumbnail_url": course.get("thumbnail_url", ""),
                "instructor_name": instructor["full_name"] if instructor else "Unknown",
                "enrollment_status": enrollment["status"],
                "progress_percentage": enrollment.get("progress_percentage", 0),
                "enrolled_at": enrollment["enrolled_at"],
                "last_accessed": enrollment.get("last_accessed")
            }
            courses.append(course_data)
    
    return {"courses": courses}

@app.post("/api/courses/{course_id}/review")
async def add_course_review(course_id: str, review: CourseReview, current_user: dict = Depends(get_current_user)):
    # Check if course exists
    course = courses_collection.find_one({"course_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled
    enrollment = enrollments_collection.find_one({
        "course_id": course_id,
        "student_id": current_user["user_id"]
    })
    
    if not enrollment:
        raise HTTPException(status_code=400, detail="You must be enrolled to review this course")
    
    # Check if already reviewed
    existing_review = course_reviews_collection.find_one({
        "course_id": course_id,
        "reviewer_id": current_user["user_id"]
    })
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this course")
    
    review_id = str(uuid.uuid4())
    review_doc = {
        "review_id": review_id,
        "course_id": course_id,
        "reviewer_id": current_user["user_id"],
        "rating": review.rating,
        "review_text": review.review_text,
        "created_at": datetime.utcnow()
    }
    
    course_reviews_collection.insert_one(review_doc)
    
    # Update course average rating
    all_reviews = list(course_reviews_collection.find({"course_id": course_id}))
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    courses_collection.update_one(
        {"course_id": course_id},
        {
            "$set": {"average_rating": avg_rating},
            "$inc": {"review_count": 1}
        }
    )
    
    return {"message": "Review added successfully", "review_id": review_id}

@app.get("/api/mentors")
async def get_mentors(skill_area: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    # Find users who have skills and are willing to mentor
    query = {}
    if skill_area:
        query["skills"] = {"$regex": skill_area, "$options": "i"}
    
    # For now, consider users with skills as potential mentors
    mentors_cursor = users_collection.find(query).limit(20)
    mentors = []
    
    for mentor in mentors_cursor:
        if mentor["user_id"] != current_user["user_id"] and mentor.get("skills"):
            # Count active mentorships
            active_mentorships = mentorships_collection.count_documents({
                "mentor_id": mentor["user_id"],
                "status": MentorshipStatus.ACTIVE
            })
            
            mentor_data = {
                "user_id": mentor["user_id"],
                "full_name": mentor["full_name"],
                "country": mentor["country"],
                "bio": mentor.get("bio", ""),
                "skills": mentor.get("skills", []),
                "work_experience": mentor.get("work_experience", ""),
                "active_mentorships": active_mentorships,
                "languages": mentor.get("languages", [])
            }
            mentors.append(mentor_data)
    
    return {"mentors": mentors}

@app.post("/api/mentorship/request")
async def request_mentorship(request: MentorshipRequest, current_user: dict = Depends(get_current_user)):
    # Check if mentor exists
    mentor = users_collection.find_one({"user_id": request.mentor_id})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Check if mentorship already exists
    existing_mentorship = mentorships_collection.find_one({
        "mentor_id": request.mentor_id,
        "mentee_id": current_user["user_id"],
        "status": {"$in": ["pending", "active"]}
    })
    
    if existing_mentorship:
        raise HTTPException(status_code=400, detail="Mentorship request already exists")
    
    mentorship_id = str(uuid.uuid4())
    mentorship_doc = {
        "mentorship_id": mentorship_id,
        "mentor_id": request.mentor_id,
        "mentee_id": current_user["user_id"],
        "skill_area": request.skill_area,
        "goals": request.goals,
        "duration_weeks": request.duration_weeks,
        "message": request.message,
        "status": MentorshipStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    mentorships_collection.insert_one(mentorship_doc)
    return {"message": "Mentorship request sent successfully", "mentorship_id": mentorship_id}

@app.get("/api/mentorship/my-mentorships")
async def get_my_mentorships(current_user: dict = Depends(get_current_user)):
    # Get mentorships where user is mentor
    as_mentor = list(mentorships_collection.find({
        "mentor_id": current_user["user_id"]
    }).sort("created_at", -1))
    
    # Get mentorships where user is mentee
    as_mentee = list(mentorships_collection.find({
        "mentee_id": current_user["user_id"]
    }).sort("created_at", -1))
    
    # Populate user data
    for mentorship in as_mentor:
        mentee = users_collection.find_one({"user_id": mentorship["mentee_id"]})
        mentorship["mentee_name"] = mentee["full_name"] if mentee else "Unknown"
        mentorship["mentee_country"] = mentee["country"] if mentee else "Unknown"
    
    for mentorship in as_mentee:
        mentor = users_collection.find_one({"user_id": mentorship["mentor_id"]})
        mentorship["mentor_name"] = mentor["full_name"] if mentor else "Unknown"
        mentorship["mentor_country"] = mentor["country"] if mentor else "Unknown"
    
    return {
        "as_mentor": as_mentor,
        "as_mentee": as_mentee
    }

@app.put("/api/mentorship/{mentorship_id}/status")
async def update_mentorship_status(mentorship_id: str, status: MentorshipStatus, current_user: dict = Depends(get_current_user)):
    mentorship = mentorships_collection.find_one({"mentorship_id": mentorship_id})
    if not mentorship:
        raise HTTPException(status_code=404, detail="Mentorship not found")
    
    # Only mentor can accept/reject, both can complete/cancel
    if status in ["active"] and mentorship["mentor_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Only mentor can accept requests")
    
    if mentorship["mentor_id"] != current_user["user_id"] and mentorship["mentee_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    mentorships_collection.update_one(
        {"mentorship_id": mentorship_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Mentorship status updated successfully"}

# Message endpoints (existing)
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