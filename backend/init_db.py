from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.models import Base, User, Student, Course, Enrollment, Attendance, Grade, RoleEnum
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")
    
    db = SessionLocal()
    
    try:
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping initialization.")
            return
        
        print("\nCreating sample data...")
        
        admin = User(
            email="admin@university.edu",
            full_name="John Administrator",
            role=RoleEnum.ADMIN,
            oauth_provider="google",
            oauth_id="admin123",
            is_active=True
        )
        db.add(admin)
        
        faculty1 = User(
            email="dr.smith@faculty.university.edu",
            full_name="Dr. Sarah Smith",
            role=RoleEnum.FACULTY,
            oauth_provider="google",
            oauth_id="faculty1",
            is_active=True
        )
        db.add(faculty1)
        
        faculty2 = User(
            email="prof.jones@faculty.university.edu",
            full_name="Prof. Michael Jones",
            role=RoleEnum.FACULTY,
            oauth_provider="microsoft",
            oauth_id="faculty2",
            is_active=True
        )
        db.add(faculty2)
        
        student_users = []
        student_names = [
            ("alice.johnson@student.edu", "Alice Johnson"),
            ("bob.wilson@student.edu", "Bob Wilson"),
            ("carol.davis@student.edu", "Carol Davis"),
            ("david.brown@student.edu", "David Brown"),
            ("emma.taylor@student.edu", "Emma Taylor"),
        ]
        
        for email, name in student_names:
            user = User(
                email=email,
                full_name=name,
                role=RoleEnum.STUDENT,
                oauth_provider="github",
                oauth_id=email.split("@")[0],
                is_active=True
            )
            db.add(user)
            student_users.append(user)
        
        db.commit()
        print("✓ Users created")
        
        students = []
        for i, user in enumerate(student_users):
            student = Student(
                user_id=user.id,
                student_id=f"STU{2024000 + i + 1}",
                date_of_birth=date(2002 + i, 1 + i, 15),
                phone=f"+1-555-{1000 + i}",
                address=f"{100 + i} Main St, City, State",
                enrollment_year=2024,
                program="Computer Science" if i < 3 else "Business Administration",
                current_semester=1 if i < 2 else 2,
                gpa=3.5 + (i * 0.1)
            )
            db.add(student)
            students.append(student)
        
        db.commit()
        print("✓ Student profiles created")
        
        courses_data = [
            ("CS101", "Introduction to Programming", "Learn Python programming basics", 3, faculty1.id),
            ("CS201", "Data Structures and Algorithms", "Advanced data structures", 4, faculty1.id),
            ("BUS101", "Business Fundamentals", "Introduction to business", 3, faculty2.id),
            ("MATH101", "Calculus I", "Differential and integral calculus", 4, faculty2.id),
            ("ENG101", "English Composition", "Writing and communication", 3, faculty1.id),
        ]
        
        courses = []
        for code, name, desc, credits, fac_id in courses_data:
            course = Course(
                course_code=code,
                course_name=name,
                description=desc,
                credits=credits,
                faculty_id=fac_id,
                semester="Fall 2024",
                academic_year="2025-2026",
                is_active=True
            )
            db.add(course)
            courses.append(course)
        
        db.commit()
        print("✓ Courses created")
        
        enrollments = []
        for student in students[:3]:
            for course in courses[:2]:  # CS101 and CS201
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    status="active"
                )
                db.add(enrollment)
                enrollments.append(enrollment)
        
        for student in students[3:]:
            for course in courses[2:4]:
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    status="active"
                )
                db.add(enrollment)
                enrollments.append(enrollment)
        
        db.commit()
        print("✓ Enrollments created")
        
        for enrollment in enrollments:
            for day_offset in range(5):
                attendance = Attendance(
                    student_id=enrollment.student_id,
                    course_id=enrollment.course_id,
                    date=date.today() - timedelta(days=day_offset),
                    status="present" if day_offset < 4 else "absent",
                    notes="Regular attendance" if day_offset < 4 else "Sick"
                )
                db.add(attendance)
        
        db.commit()
        print("✓ Attendance records created")
        
        assessment_types = ["midterm", "quiz", "assignment", "final"]
        for enrollment in enrollments:
            for i, assessment in enumerate(assessment_types):
                grade = Grade(
                    student_id=enrollment.student_id,
                    course_id=enrollment.course_id,
                    assessment_type=assessment,
                    assessment_name=f"{assessment.capitalize()} {i+1}",
                    score=85 + i * 2,
                    max_score=100,
                    percentage=(85 + i * 2),
                    letter_grade="A" if i > 2 else "B+",
                    date_assessed=date.today() - timedelta(days=10 + i * 5)
                )
                db.add(grade)
        
        db.commit()
        print("✓ Grades created")
        
        print("\n" + "="*50)
        print("Database initialized successfully!")
        print("="*50)
        print("\nSample Login Credentials:")
        print("\nAdmin:")
        print("  Email: admin@university.edu")
        print("\nFaculty:")
        print("  Email: dr.smith@faculty.university.edu")
        print("  Email: prof.jones@faculty.university.edu")
        print("\nStudents:")
        for email, name in student_names:
            print(f"  Email: {email}")
        print("\nNote: In demo mode, any OAuth login will auto-authenticate")
        print("="*50)
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Student Management System - Database Initialization")
    print("="*50)
    init_db()
