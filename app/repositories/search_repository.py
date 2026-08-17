from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.researcher import Researcher
from app.models.publication import Publication, PublicationType, PublicationStatus
from app.models.institution import Institution
from app.models.department import Department


class SearchRepository:

    @staticmethod
    def search_researchers(
        db: Session,
        query: str,
        page: int,
        page_size: int,
        institution: str = None,
        sort: str = "relevance",
    ):
        term = f"%{query.strip()}%"

        q = (
            db.query(Researcher)
            .outerjoin(Researcher.publications)
            .outerjoin(Researcher.departments)
            .outerjoin(Department.institution)
            .filter(
                or_(
                    Researcher.first_name.ilike(term),
                    Researcher.last_name.ilike(term),
                    (Researcher.first_name + " " + Researcher.last_name).ilike(term),
                    Researcher.bio.ilike(term),
                    Researcher.orcid.ilike(term),
                    Researcher.skills.ilike(term),
                    Researcher.interests.ilike(term),
                    Publication.title.ilike(term),
                    Publication.abstract.ilike(term),
                    Department.name.ilike(term),
                    Institution.name.ilike(term),
                )
            )
            .distinct()
        )

        if institution:
            q = q.filter(
                Institution.name.ilike(f"%{institution.strip()}%")
            )

        if sort == "oldest":
            q = q.order_by(Researcher.first_name.asc(), Researcher.last_name.asc())
        elif sort == "newest":
            q = q.order_by(Researcher.created_at.desc())
        else:
            q = q.order_by(Researcher.last_name.asc(), Researcher.first_name.asc())

        total = q.count()

        data = (
            q.offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return total, data

    @staticmethod
    def search_publications(
        db: Session,
        query: str,
        page: int,
        page_size: int,
        year: int = None,
        publication_type: str = None,
        status: str = None,
        institution: str = None,
        sort: str = "relevance",
    ):
        term = f"%{query.strip()}%"

        q = (
            db.query(Publication)
            .outerjoin(Publication.researchers)
            .outerjoin(Researcher.departments)
            .outerjoin(Department.institution)
            .filter(
                or_(
                    Publication.title.ilike(term),
                    Publication.abstract.ilike(term),
                    Publication.doi.ilike(term),
                    Publication.journal.ilike(term),
                    Publication.conference.ilike(term),
                    Researcher.first_name.ilike(term),
                    Researcher.last_name.ilike(term),
                    (Researcher.first_name + " " + Researcher.last_name).ilike(term),
                    Institution.name.ilike(term),
                )
            )
            .distinct()
        )

        if year:
            q = q.filter(Publication.publication_year == year)

        if publication_type:
            try:
                q = q.filter(
                    Publication.publication_type == PublicationType(publication_type)
                )
            except ValueError:
                return 0, []

        if status:
            try:
                q = q.filter(
                    Publication.status == PublicationStatus(status)
                )
            except ValueError:
                return 0, []

        if institution:
            q = q.filter(
                Institution.name.ilike(f"%{institution.strip()}%")
            )

        if sort == "newest":
            q = q.order_by(Publication.publication_year.desc())
        elif sort == "oldest":
            q = q.order_by(Publication.publication_year.asc())
        elif sort == "citations":
            q = q.order_by(Publication.citation_count.desc())
        else:
            q = q.order_by(Publication.publication_year.desc())

        total = q.count()

        data = (
            q.offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return total, data

    @staticmethod
    def search_institutions(
        db: Session,
        query: str,
        page: int,
        page_size: int,
        sort: str = "relevance",
    ):
        term = f"%{query.strip()}%"

        q = (
            db.query(Institution)
            .outerjoin(Institution.departments)
            .filter(
                or_(
                    Institution.name.ilike(term),
                    Institution.abbreviation.ilike(term),
                    Institution.website.ilike(term),
                    Institution.email.ilike(term),
                    Institution.address.ilike(term),
                    Institution.city.ilike(term),
                    Institution.state.ilike(term),
                    Institution.country.ilike(term),
                    Department.name.ilike(term),
                )
            )
            .distinct()
        )

        if sort == "oldest":
            q = q.order_by(Institution.name.asc())
        elif sort == "newest":
            q = q.order_by(Institution.created_at.desc())
        else:
            q = q.order_by(Institution.name.asc())

        total = q.count()

        data = (
            q.offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return total, data
