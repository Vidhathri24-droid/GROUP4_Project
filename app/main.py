from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine

# Import all models to register with Base
import app.models.user
import app.models.researcher
import app.models.institution
import app.models.department
import app.models.conference
import app.models.conference_registration
import app.models.publication
import app.models.notification
import app.models.collaboration
import app.models.citation

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as user_router
from app.api.routes.researchers import router as researcher_router
from app.api.routes.institutions import router as institution_router
from app.api.routes.departments import router as department_router
from app.api.routes.conferences import router as conference_router
from app.api.routes.publications import router as publication_router
from app.api.routes.notification import router as notification_router
from app.api.routes.collaborations import router as collaboration_router
from app.api.routes.citations import router as citation_router
from app.api.routes import analytics
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.home import router as home_router
from app.api.routes.search import router as search_router
from app.api.routes.reviewer import router as reviewer_router
from app.api.routes.admin import router as admin_router

from app.core.config import settings

app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    version="1.0.0",
)

@app.on_event("startup")
def startup_db():
    # Force table creation on startup
    Base.metadata.create_all(bind=engine)

cors_origins = {
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(researcher_router)
app.include_router(institution_router)
app.include_router(department_router)
app.include_router(conference_router)
app.include_router(publication_router)
app.include_router(collaboration_router)
app.include_router(notification_router)
app.include_router(citation_router)
app.include_router(analytics.router)
app.include_router(dashboard_router)
app.include_router(home_router)
app.include_router(search_router)
app.include_router(reviewer_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Scientific Collaboration Network Analyzer API"
    }