# Fullstack Media Gallery Demo

A small learning and portfolio project for building a fullstack media gallery. It is intentionally kept simple while I learn and document the individual steps.

## Live preview

[Open the static frontend preview](https://codemorra.github.io/fullstack-media-gallery-demo/)

GitHub Pages hosts only the static frontend. The public sample gallery is
available, while registration, login, logout, and future upload features require
a backend.

## Current status

Work in progress. The current version includes:

- a React, TypeScript, Tailwind CSS frontend with React Router
- a FastAPI backend with SQLite and SQLAlchemy
- registration, login, logout, and session-based authentication
- a public gallery with locally bundled sample images
- Alembic database migrations for schema changes

Media uploads, user-owned gallery content, image processing, and further visual
polish are planned for later iterations.

## Run locally

### Backend

Create a local environment file from the example and set a random value for `SESSION_SECRET`.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Its interactive API
documentation is available at `http://localhost:8000/docs`.

### Database migrations

Apply all available migrations before starting the backend:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

After changing SQLAlchemy models, generate and review a migration before
applying it:

```bash
alembic revision --autogenerate -m "describe schema change"
alembic upgrade head
```

### Frontend

In a second terminal, create the local frontend configuration and start Vite:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend is normally available at `http://localhost:5173`. The public
sample gallery works without a backend; run both applications to test
registration and login locally.

## License

This project is licensed under the [MIT License](LICENSE).
