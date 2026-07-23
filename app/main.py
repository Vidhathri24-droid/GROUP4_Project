from fastapi import FastAPI
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as user_router
from app.api.routes.researchers import router as researcher_router
from app.api.routes.institutions import router as institution_router
from app.api.routes.departments import router as department_router
from app.api.routes.conferences import router as conference_router

app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(researcher_router)
app.include_router(institution_router)
app.include_router(department_router)
app.include_router(conference_router)

@app.get("/")
def root():
    return {
        "message": "Scientific Collaboration Network Analyzer API"
    }
