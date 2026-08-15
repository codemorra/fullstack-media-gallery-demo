from fastapi import FastAPI

app = FastAPI(title="Fullstack Media Gallery API")


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
