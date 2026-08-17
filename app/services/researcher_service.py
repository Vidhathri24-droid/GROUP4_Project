from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.researcher import Researcher
from app.models.department import Department
from app.repositories.researcher_repository import ResearcherRepository
from app.repositories.user_repository import UserRepository
from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherUpdate,
)


class ResearcherService:
    @staticmethod
    def researcher_to_response(researcher):
        institutions = {}

        for department in researcher.departments:
            institution = department.institution

            if institution:
                institutions[str(institution.id)] = {
                    "id": institution.id,
                    "name": institution.name,
                }

        return {
            "id": researcher.id,
            "user_id": researcher.user_id,
            "first_name": researcher.first_name,
            "last_name": researcher.last_name,
            "bio": researcher.bio,
            "phone": researcher.phone,
            "experience": researcher.experience,
            "orcid": researcher.orcid,
            "google_scholar": researcher.google_scholar,
            "research_gate": researcher.research_gate,
            "linkedin": researcher.linkedin,
            "skills": researcher.skills,
            "interests": researcher.interests,

            "departments": [
                {
                    "id": d.id,
                    "name": d.name,
                    "institution_id": d.institution_id,
                }
                for d in researcher.departments
            ],

            "institutions": list(institutions.values()),

            "publications": researcher.publications,
        }
    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create_researcher(
        db: Session,
        researcher_data: ResearcherCreate,
    ):
        # --------------------------------------------------------
        # Check user
        # --------------------------------------------------------

        user = UserRepository.get_by_id(
            db,
            researcher_data.user_id,
        )

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        # --------------------------------------------------------
        # Prevent duplicate researcher profile
        # --------------------------------------------------------

        existing = ResearcherRepository.get_by_user_id(
            db,
            researcher_data.user_id,
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Researcher profile already exists for this user",
            )

        # --------------------------------------------------------
        # Validate departments
        # --------------------------------------------------------

        departments = []

        if researcher_data.department_ids:

            departments = (
                db.query(Department)
                .filter(
                    Department.id.in_(
                        researcher_data.department_ids
                    )
                )
                .all()
            )

            if len(departments) != len(
                set(researcher_data.department_ids)
            ):
                raise HTTPException(
                    status_code=400,
                    detail="One or more departments were not found",
                )

        # --------------------------------------------------------
        # Create researcher
        # --------------------------------------------------------

        researcher = Researcher(
            user_id=researcher_data.user_id,
            first_name=researcher_data.first_name,
            last_name=researcher_data.last_name or "",
            bio=researcher_data.bio,
            phone=researcher_data.phone,
            experience=researcher_data.experience or 0,
            orcid=researcher_data.orcid,
            google_scholar=researcher_data.google_scholar,
            research_gate=researcher_data.research_gate,
            linkedin=researcher_data.linkedin,
            skills=researcher_data.skills,
            interests=researcher_data.interests,
        )

        # --------------------------------------------------------
        # LINK RESEARCHER → DEPARTMENT
        # Department automatically determines institution
        # --------------------------------------------------------

        researcher.departments = departments

        db.add(researcher)
        db.commit()
        db.refresh(researcher)

        return researcher

    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all_researchers(
        db: Session,
    ):
        return (
            db.query(Researcher)
            .all()
        )

    # ============================================================
    # GET ONE
    # ============================================================

    @staticmethod
    def get_researcher(
        db: Session,
        researcher_id: UUID,
    ):

        researcher = (
            db.query(Researcher)
            .filter(
                Researcher.id == researcher_id
            )
            .first()
        )

        if researcher is None:
            raise HTTPException(
                status_code=404,
                detail="Researcher not found",
            )

        return researcher

    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update_researcher(
        db: Session,
        researcher_id: UUID,
        researcher_data: ResearcherUpdate,
    ):

        researcher = (
            db.query(Researcher)
            .filter(
                Researcher.id == researcher_id
            )
            .first()
        )

        if researcher is None:
            raise HTTPException(
                status_code=404,
                detail="Researcher not found",
            )

        # --------------------------------------------------------
        # Update normal fields
        # --------------------------------------------------------

        update_data = researcher_data.model_dump(
            exclude_unset=True,
            exclude={"department_ids"},
        )

        for field, value in update_data.items():
            setattr(
                researcher,
                field,
                value,
            )

        # --------------------------------------------------------
        # Update department/institution assignment
        # --------------------------------------------------------

        if researcher_data.department_ids is not None:

            departments = (
                db.query(Department)
                .filter(
                    Department.id.in_(
                        researcher_data.department_ids
                    )
                )
                .all()
            )

            if len(departments) != len(
                set(researcher_data.department_ids)
            ):
                raise HTTPException(
                    status_code=400,
                    detail="One or more departments were not found",
                )

            # This replaces the existing links
            researcher.departments = departments

        db.commit()
        db.refresh(researcher)

        return researcher

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete_researcher(
        db: Session,
        researcher_id: UUID,
    ):

        researcher = (
            db.query(Researcher)
            .filter(
                Researcher.id == researcher_id
            )
            .first()
        )

        if researcher is None:
            raise HTTPException(
                status_code=404,
                detail="Researcher not found",
            )

        db.delete(researcher)
        db.commit()

        return {
            "message": "Researcher deleted successfully"
        }