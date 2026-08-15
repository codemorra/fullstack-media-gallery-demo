from fastapi import FastAPI
from app.database import engine, Base
from app.models import User  # needed to create users table # noqa: F401

app = FastAPI(title="Fullstack Media Gallery API")

Base.metadata.create_all(bind=engine)


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
