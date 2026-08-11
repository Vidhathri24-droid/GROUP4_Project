from uuid import UUID

from sqlalchemy.orm import Session

from app.models.researcher import Researcher

from sqlalchemy import or_

class ResearcherRepository:

    @staticmethod
    def create(
        db: Session,
        researcher: Researcher,
    ):
        db.add(researcher)
        db.commit()
        db.refresh(researcher)
        return researcher

    @staticmethod
    def get_all(
        db: Session,
    ):
        return (
            db.query(Researcher)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        researcher_id: UUID,
    ):
        return (
            db.query(Researcher)
            .filter(
                Researcher.id == researcher_id
            )
            .first()
        )

    @staticmethod
    def get_by_user_id(
        db: Session,
        user_id: UUID,
    ):
        return (
            db.query(Researcher)
            .filter(
                Researcher.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def update(db, researcher):
        # Convert empty strings to NULL for optional fields.
        # This is especially important for unique fields such as ORCID.
        optional_fields = [
            "phone",
            "bio",
            "orcid",
            "google_scholar",
            "research_gate",
            "linkedin",
        ]

        for field in optional_fields:
            value = getattr(researcher, field, None)

            if isinstance(value, str):
                value = value.strip()

                if value == "":
                    setattr(researcher, field, None)
                else:
                    setattr(researcher, field, value)

        db.commit()
        db.refresh(researcher)

        return researcher

    @staticmethod
    def delete(
        db: Session,
        researcher: Researcher,
    ):
        db.delete(researcher)
        db.commit()
    @staticmethod
    def search(
        db: Session,
        query: str,
    ):
        return (
            db.query(Researcher)
            .filter(
                or_(
                    Researcher.first_name.ilike(f"%{query}%"),
                    Researcher.last_name.ilike(f"%{query}%"),
                )
            )
            .all()
        )