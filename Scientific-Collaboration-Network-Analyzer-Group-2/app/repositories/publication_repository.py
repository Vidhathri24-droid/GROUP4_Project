from uuid import UUID

from sqlalchemy import or_, asc, desc
from sqlalchemy.orm import Session

from app.models.publication import Publication


class PublicationRepository:

    def create(
        self,
        db: Session,
        publication: Publication,
    ) -> Publication:
        db.add(publication)
        db.commit()
        db.refresh(publication)
        return publication

    def get_by_id(
        self,
        db: Session,
        publication_id: UUID,
    ) -> Publication | None:
        return (
            db.query(Publication)
            .filter(Publication.id == publication_id)
            .first()
        )

    def get_all(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Publication]:
        return (
            db.query(Publication)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_owner(
        self,
        db: Session,
        owner_id: UUID,
    ) -> list[Publication]:
        return (
            db.query(Publication)
            .filter(Publication.owner_id == owner_id)
            .all()
        )

    def get_by_doi(
        self,
        db: Session,
        doi: str,
    ) -> Publication | None:
        return (
            db.query(Publication)
            .filter(Publication.doi == doi)
            .first()
        )

    def search(
        self,
        db: Session,
        keyword: str,
    ) -> list[Publication]:
        return (
            db.query(Publication)
            .filter(
                or_(
                    Publication.title.ilike(f"%{keyword}%"),
                    Publication.abstract.ilike(f"%{keyword}%"),
                    Publication.journal.ilike(f"%{keyword}%"),
                    Publication.conference.ilike(f"%{keyword}%"),
                    Publication.doi.ilike(f"%{keyword}%"),
                )
            )
            .all()
        )

    def update(
        self,
        db: Session,
        publication: Publication,
    ) -> Publication:
        db.commit()
        db.refresh(publication)
        return publication

    def delete(
        self,
        db: Session,
        publication: Publication,
    ) -> None:
        db.delete(publication)
        db.commit()

    def get_sorted(
        self,
        db: Session,
        order_by,
    ) -> list[Publication]:
        return (
            db.query(Publication)
            .order_by(order_by)
            .all()
        )

    def filter_and_sort(
    	self,
    	db: Session,
    	publication_year: int | None = None,
    	publication_type: str | None = None,
    	status: str | None = None,
    	journal: str | None = None,
    	conference: str | None = None,
    	sort_by: str = "publication_year",
    	order: str = "desc",
    ):

    	query = db.query(Publication)

    	if publication_year is not None:
        	query = query.filter(
            	Publication.publication_year == publication_year
        	)

    	if publication_type:
        	query = query.filter(
            	Publication.publication_type == publication_type
        	)

    	if status:
        	query = query.filter(
            	Publication.status == status
        	)

    	if journal:
        	query = query.filter(
            	Publication.journal.ilike(f"%{journal}%")
        	)

    	if conference:
        	query = query.filter(
            	Publication.conference.ilike(f"%{conference}%")
        	)

    	sortable_fields = {
        	"publication_year": Publication.publication_year,
        	"citation_count": Publication.citation_count,
        	"title": Publication.title,
    	}

    	column = sortable_fields.get(
        	sort_by,
        	Publication.publication_year,
    	)

    	if order.lower() == "asc":
        	query = query.order_by(asc(column))
    	else:
        	query = query.order_by(desc(column))

    	return query.all()

publication_repository = PublicationRepository()
