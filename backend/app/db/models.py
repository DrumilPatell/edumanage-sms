from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    FACULTY = "faculty"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.STUDENT)
    
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_courses = relationship("Course", back_populates="faculty")
    

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    
    enrollment_year = Column(Integer, nullable=True)
    program = Column(String(100), nullable=True)
    current_semester = Column(String(50), nullable=True)
    gpa = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(20), unique=True, index=True, nullable=False)
    course_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    credits = Column(Integer, nullable=False, default=3)
    
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    semester = Column(String(50), nullable=True)
    academic_year = Column(String(20), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    faculty = relationship("User", back_populates="faculty_courses")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="course", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="course", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="active")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    student = relationship("Student", back_populates="attendance_records")
    course = relationship("Course", back_populates="attendance_records")


class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    
    assessment_type = Column(String(50), nullable=False)
    assessment_name = Column(String(255), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=True)
    letter_grade = Column(String(5), nullable=True)
    
    date_assessed = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")


class Semester(Base):
    __tablename__ = "semesters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    is_current = Column(Boolean, default=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
