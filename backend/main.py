from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from database import get_session, create_db_and_tables
from models import User, VideoClass, Enrollment, UserRole
import os
from dotenv import load_dotenv
import secrets
import uuid
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List as PyList, Optional

load_dotenv()

app = FastAPI(title="Video Streaming Class API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stream.io configuration
STREAM_API_KEY = os.getenv("STREAM_API_KEY")
STREAM_API_SECRET = os.getenv("STREAM_API_SECRET")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Pydantic models for API
class ClassCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    duration_minutes: int = 60

class ClassResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    teacher_name: str
    join_link: str
    is_active: bool
    scheduled_time: Optional[datetime] = None

class UserCreate(BaseModel):
    email: str
    name: str
    role: UserRole

# Helper function to generate Stream token
def generate_stream_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "iss": "stream-io-api",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, STREAM_API_SECRET, algorithm="HS256")

# Authentication helper (simplified)
async def get_current_user(user_id: int, session: Session = Depends(get_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/users/", response_model=User)
async def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    user = User(**user_data.dict())
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.post("/api/classes/", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    teacher_id: int,
    session: Session = Depends(get_session)
):
    # Verify teacher exists and has teacher role
    teacher = session.get(User, teacher_id)
    if not teacher or teacher.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can create classes")

    # Generate unique call ID for Stream.io
    call_id = str(uuid.uuid4())

    # Generate join link
    join_link = f"http://localhost:3000/join/{call_id}"

    # Create class in database
    video_class = VideoClass(
        title=class_data.title,
        description=class_data.description,
        teacher_id=teacher_id,
        stream_call_id=call_id,
        scheduled_time=class_data.scheduled_time,
        duration_minutes=class_data.duration_minutes,
        join_link=join_link
    )

    session.add(video_class)
    session.commit()
    session.refresh(video_class)

    return ClassResponse(
        id=video_class.id,
        title=video_class.title,
        description=video_class.description,
        teacher_name=teacher.name,
        join_link=video_class.join_link,
        is_active=video_class.is_active,
        scheduled_time=video_class.scheduled_time
    )

@app.get("/api/classes/", response_model=PyList[ClassResponse])
async def get_classes(session: Session = Depends(get_session)):
    statement = select(VideoClass, User).join(User)
    results = session.exec(statement)

    classes = []
    for video_class, teacher in results:
        classes.append(ClassResponse(
            id=video_class.id,
            title=video_class.title,
            description=video_class.description,
            teacher_name=teacher.name,
            join_link=video_class.join_link,
            is_active=video_class.is_active,
            scheduled_time=video_class.scheduled_time
        ))

    return classes

@app.get("/api/classes/{class_id}/token")
async def get_stream_token(
    class_id: int,
    user_id: int,
    session: Session = Depends(get_session)
):
    video_class = session.get(VideoClass, class_id)
    user = session.get(User, user_id)

    if not video_class or not user:
        raise HTTPException(status_code=404, detail="Class or user not found")

    # Generate Stream.io token
    token = generate_stream_token(str(user_id))

    return {
        "token": token,
        "call_id": video_class.stream_call_id,
        "user_id": str(user_id),
        "api_key": STREAM_API_KEY
    }

@app.post("/api/classes/{class_id}/start")
async def start_class(
    class_id: int,
    teacher_id: int,
    session: Session = Depends(get_session)
):
    video_class = session.get(VideoClass, class_id)
    if not video_class or video_class.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    video_class.is_active = True
    session.commit()

    return {"message": "Class started successfully"}

@app.post("/api/classes/{class_id}/end")
async def end_class(
    class_id: int,
    teacher_id: int,
    session: Session = Depends(get_session)
):
    video_class = session.get(VideoClass, class_id)
    if not video_class or video_class.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    video_class.is_active = False
    session.commit()

    return {"message": "Class ended successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
