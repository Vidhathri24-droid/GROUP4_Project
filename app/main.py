from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Apne existing routes ko import karein
from app.api.routes import researchers, users, institutions, departments

app = FastAPI(title="Scientific Collaboration Network Analyzer")

# 🔴 CORS SETTINGS (Frontend port 3000 ko allow karne ke liye)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Agar Vite browser use ho raha ho
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development ke liye sabhi origins allowed hain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes Include Karein
app.include_router(researchers.router)
app.include_router(users.router)
app.include_router(institutions.router)
app.include_router(departments.router)

@app.get("/")
def read_root():
    return {"message": "API is running successfully!"}