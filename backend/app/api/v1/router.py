from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, students, courses, enrollments, academic, semesters, contact

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(academic.router, prefix="/academic", tags=["Academic"])
api_router.include_router(semesters.router, prefix="/semesters", tags=["Semesters"])
api_router.include_router(contact.router, tags=["Contact"])
