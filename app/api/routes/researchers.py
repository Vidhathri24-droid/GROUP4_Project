from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.models.researcher import Researcher

router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"],
)

@router.get("/")
def get_researchers(db: Session = Depends(get_db)):
    # 💡 Real DB Query (Jab DB me records insert ho jayein):
    # researchers = db.query(Researcher).all()
    # return researchers

    # Current Mock Response (Jo tumhara frontend easily consume kar raha hai):
    return [
        {
            "id": "1",
            "name": "Dr. A. Sharma",
            "department": "Computer Science",
            "institution": "IIT Bombay",
            "citations_count": 45,
            "publications": [
                {"id": "p1", "title": "AI in Healthcare"},
                {"id": "p2", "title": "Graph Neural Networks"}
            ]
        },
        {
            "id": "2",
            "name": "Prof. R. Verma",
            "department": "Physics",
            "institution": "IIT Delhi",
            "citations_count": 32,
            "publications": [
                {"id": "p1", "title": "AI in Healthcare"},
                {"id": "p3", "title": "Quantum Computing"}
            ]
        },
        {
            "id": "3",
            "name": "Dr. S. Kulkarni",
            "department": "Computer Science",
            "institution": "IIT Bombay",
            "citations_count": 89,
            "publications": [
                {"id": "p2", "title": "Graph Neural Networks"}
            ]
        },
        {
            "id": "4",
            "name": "Dr. M. Gupta",
            "department": "Mathematics",
            "institution": "IISc Bangalore",
            "citations_count": 12,
            "publications": [
                {"id": "p4", "title": "Linear Algebra Algorithms"}
            ]
        },
        {
            "id": "5",
            "name": "Prof. K. Mehta",
            "department": "Physics",
            "institution": "IIT Bombay",
            "citations_count": 67,
            "publications": [
                {"id": "p3", "title": "Quantum Computing"}
            ]
        }
    ]