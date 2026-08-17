from uuid import UUID
from typing import Optional

from pydantic import BaseModel, ConfigDict
from app.schemas.publication import PublicationResponse


class ResearcherBase(BaseModel):
    user_id: UUID

    first_name: str
    last_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[int] = 0

    orcid: Optional[str] = None
    google_scholar: Optional[str] = None
    research_gate: Optional[str] = None
    linkedin: Optional[str] = None

    skills: Optional[str] = None
    interests: Optional[str] = None


class ResearcherCreate(ResearcherBase):
    # Existing institution/department assignment
    department_ids: list[UUID] = []


class ResearcherUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[int] = None

    orcid: Optional[str] = None
    google_scholar: Optional[str] = None
    research_gate: Optional[str] = None
    linkedin: Optional[str] = None

    skills: Optional[str] = None
    interests: Optional[str] = None

    # Existing institution/department assignment
    department_ids: Optional[list[UUID]] = None


class DepartmentSummary(BaseModel):
    id: UUID
    name: str
    institution_id: UUID

    model_config = ConfigDict(
        from_attributes=True
    )


class InstitutionSummary(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ResearcherResponse(ResearcherBase):
    id: UUID

    departments: list[DepartmentSummary] = []
    institutions: list[InstitutionSummary] = []

    publications: list[PublicationResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )