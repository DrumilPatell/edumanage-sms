import sys
sys.path.insert(0, '.')

from app.db.database import SessionLocal
from app.db.models import Grade

db = None
try:
    db = SessionLocal()
    grades = db.query(Grade).all()
    print(f'Total grades in database: {len(grades)}')
    if len(grades) == 0:
        print('No grades found in database!')
    else:
        for g in grades:
            print(f'ID: {g.id}, Student: {g.student_id}, Course: {g.course_id}, Type: {g.assessment_type}, Name: {g.assessment_name}, Score: {g.score}/{g.max_score}, Letter Grade: {g.letter_grade}, Percentage: {g.percentage}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
finally:
    if db is not None:
        db.close()
