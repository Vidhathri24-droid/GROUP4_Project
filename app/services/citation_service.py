from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.citation import Citation
from app.repositories.citation_repository import CitationRepository
from app.repositories.publication_repository import PublicationRepository
from app.schemas.citation import CitationCreate, CitationUpdate

from app.utils.citation_formatter import CitationFormatter
from app.utils.bibtex_exporter import BibTexExporter


class CitationService:

    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create_citation(
        db: Session,
        data: CitationCreate,
    ):

        publication = PublicationRepository.get_by_id(
            db,
            data.publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found",
            )

        citation = Citation(
            publication_id=data.publication_id,
            title=data.title,
            authors=data.authors,
            journal=data.journal,
            year=data.year,
            volume=data.volume,
            issue=data.issue,
            pages=data.pages,
            doi=data.doi,
            url=data.url,
            citation_style=data.citation_style,
        )

        style = (
            citation.citation_style or "APA"
        ).lower()

        if style == "apa":
            citation.formatted_citation = (
                CitationFormatter.apa(citation)
            )

        elif style == "ieee":
            citation.formatted_citation = (
                CitationFormatter.ieee(citation)
            )

        elif style == "mla":
            citation.formatted_citation = (
                CitationFormatter.mla(citation)
            )

        elif style == "chicago":
            citation.formatted_citation = (
                CitationFormatter.chicago(citation)
            )

        elif style == "harvard":
            citation.formatted_citation = (
                CitationFormatter.harvard(citation)
            )

        else:
            citation.formatted_citation = (
                CitationFormatter.apa(citation)
            )

        return CitationRepository.create(
            db,
            citation,
        )


    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all_citations(
        db: Session,
        current_user=None,
        mine: bool = False,
    ):

        query = (
            db.query(Citation)
            .join(
                Citation.publication
            )
        )

        # --------------------------------------------------------
        # My Citations
        # --------------------------------------------------------

        if mine:

            if current_user is None:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required.",
                )

            query = query.filter(
                Publication.owner_id == current_user.id
            )

        return query.all()


    # ============================================================
    # GET ONE
    # ============================================================

    @staticmethod
    def get_citation(
        db: Session,
        citation_id: UUID,
    ):

        citation = CitationRepository.get_by_id(
            db,
            citation_id,
        )

        if citation is None:
            return None

        return citation


    # ============================================================
    # GET BY PUBLICATION
    # ============================================================

    @staticmethod
    def get_by_publication(
        db: Session,
        publication_id: UUID,
    ):

        publication = PublicationRepository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found",
            )

        return CitationRepository.get_by_publication(
            db,
            publication_id,
        )


    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update_citation(
        db: Session,
        citation_id: UUID,
        data: CitationUpdate,
    ):

        citation = CitationRepository.get_by_id(
            db,
            citation_id,
        )

        if citation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citation not found",
            )

        if data.title is not None:
            citation.title = data.title

        if data.authors is not None:
            citation.authors = data.authors

        if data.journal is not None:
            citation.journal = data.journal

        if data.year is not None:
            citation.year = data.year

        if data.volume is not None:
            citation.volume = data.volume

        if data.issue is not None:
            citation.issue = data.issue

        if data.pages is not None:
            citation.pages = data.pages

        if data.doi is not None:
            citation.doi = data.doi

        if data.url is not None:
            citation.url = data.url

        if data.citation_style is not None:
            citation.citation_style = data.citation_style

        style = (
            citation.citation_style or "APA"
        ).lower()

        if style == "apa":
            citation.formatted_citation = (
                CitationFormatter.apa(citation)
            )

        elif style == "ieee":
            citation.formatted_citation = (
                CitationFormatter.ieee(citation)
            )

        elif style == "mla":
            citation.formatted_citation = (
                CitationFormatter.mla(citation)
            )

        elif style == "chicago":
            citation.formatted_citation = (
                CitationFormatter.chicago(citation)
            )

        elif style == "harvard":
            citation.formatted_citation = (
                CitationFormatter.harvard(citation)
            )

        else:
            citation.formatted_citation = (
                CitationFormatter.apa(citation)
            )

        db.commit()
        db.refresh(citation)

        return citation


    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete_citation(
        db: Session,
        citation_id: UUID,
    ):

        citation = CitationRepository.get_by_id(
            db,
            citation_id,
        )

        if citation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citation not found",
            )

        CitationRepository.delete(
            db,
            citation,
        )

        return {
            "message": "Citation deleted successfully"
        }


    # ============================================================
    # BIBTEX
    # ============================================================

    @staticmethod
    def export_bibtex(
        db: Session,
        citation_id: UUID,
    ):

        citation = CitationRepository.get_by_id(
            db,
            citation_id,
        )

        if citation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citation not found",
            )

        return BibTexExporter.export(
            citation
        )