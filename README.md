# Fullstack Media Gallery Demo

A small learning and portfolio project for building a fullstack media gallery. It is intentionally kept simple while I learn and document the individual steps.

## Current status

Work in progress. The current version includes:

- a React, TypeScript, Tailwind CSS frontend with React Router
- a FastAPI backend with SQLite and SQLAlchemy
- registration, login, logout, and session-based authentication
- a protected gallery route with placeholder data

Media uploads, image processing, gallery content, and further visual polish are planned for later iterations.

## Run locally

### Backend

Create a local environment file from the example and set a random value for `SESSION_SECRET`.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.

### Frontend

In a second terminal, create the local frontend configuration and start Vite:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend is normally available at `http://localhost:5173`. Register a new demo account, then log in to access the protected gallery route.

## License

This project is licensed under the [MIT License](LICENSE).
