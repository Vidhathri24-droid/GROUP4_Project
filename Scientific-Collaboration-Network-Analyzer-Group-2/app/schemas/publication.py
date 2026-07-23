from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, HttpUrl

class PublicationType(str, Enum):
    JOURNAL = "Journal"
    CONFERENCE = "Conference"
    BOOK = "Book"
    BOOK_CHAPTER = "Book Chapter"
    THESIS = "Thesis"
    PATENT = "Patent"

class PublicationStatus(str, Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    ACCEPTED = "Accepted"
    PUBLISHED = "Published"
    REJECTED = "Rejected"

class PublicationBase(BaseModel):

    title: str

    abstract: Optional[str] = None

    doi: Optional[str] = None

    journal: Optional[str] = None

    conference: Optional[str] = None

    publication_year: int

    publication_type: PublicationType

    status: PublicationStatus = PublicationStatus.DRAFT

    url: Optional[HttpUrl] = None

    citation_count: int = 0

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(BaseModel):

    title: Optional[str] = None

    abstract: Optional[str] = None

    doi: Optional[str] = None

    journal: Optional[str] = None

    conference: Optional[str] = None

    publication_year: Optional[int] = None

    publication_type: Optional[PublicationType] = None

    status: Optional[PublicationStatus] = None

    url: Optional[HttpUrl] = None

    citation_count: Optional[int] = None

class PublicationResponse(PublicationBase):

    id: UUID

    owner_id: UUID

    file_name: Optional[str]

    file_type: Optional[str]

    file_size: Optional[int]

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PublicationSearch(BaseModel):

    keyword: Optional[str] = None

    year: Optional[int] = None

    publication_type: Optional[PublicationType] = None

    status: Optional[PublicationStatus] = None

class PublicationSort(BaseModel):

    sort_by: str = "publication_year"

    descending: bool = True

class PublicationListResponse(BaseModel):

    total: int

    page: int

    page_size: int

    items: list[PublicationResponse]
