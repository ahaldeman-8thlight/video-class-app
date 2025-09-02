from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    TEACHER = "teacher"
    STUDENT = "student"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    classes_taught: List["VideoClass"] = Relationship(back_populates="teacher")
    enrollments: List["Enrollment"] = Relationship(back_populates="student")

class VideoClass(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    teacher_id: int = Field(foreign_key="user.id")
    stream_call_id: str = Field(unique=True)  # Stream.io call ID
    scheduled_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    is_active: bool = Field(default=False)
    join_link: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    teacher: User = Relationship(back_populates="classes_taught")
    enrollments: List["Enrollment"] = Relationship(back_populates="video_class")

class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    class_id: int = Field(foreign_key="videoclass.id")
    joined_at: Optional[datetime] = None

    # Relationships
    student: User = Relationship(back_populates="enrollments")
    video_class: VideoClass = Relationship(back_populates="enrollments")
