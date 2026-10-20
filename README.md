# Fullstack Media Gallery Demo

A small learning and portfolio project for building a fullstack media gallery. It is intentionally kept simple while I learn and document the individual steps.

## Live preview

[Open the static frontend preview](https://codemorra.github.io/fullstack-media-gallery-demo/)

GitHub Pages hosts only the static frontend. The public sample gallery is
available, while registration, login, logout, the personal gallery, and future
upload features require a backend.

## Current status

Work in progress. The current version includes:

- a React, TypeScript, Tailwind CSS frontend with React Router
- a FastAPI backend with SQLite and SQLAlchemy
- registration, login, logout, and session-based authentication
- a public gallery connected to the backend API, with static samples for the preview
- an authenticated personal gallery showing the user's public and private entries
- Alembic database migrations for schema changes
- a media model with ownership and visibility, plus a local demo seed script
- a public gallery API that returns only public media records

Media uploads, editing and deleting images, visibility controls, image processing,
and further visual polish are planned for later iterations.

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

### Local demo data

After applying the migrations, run this command from `backend/` with the
virtual environment activated:

```bash
python -m app.seed
```

The script prompts for a password (10-128 characters) for newly created demo
accounts: `demo.alex@example.com` and `demo.sam@example.com`. It creates six
media records referencing the existing sample images, four public and two
private. Running it again adds missing records without resetting passwords
or overwriting existing media.

Visibility currently applies only to database records. The sample image files
in `frontend/public/` remain publicly accessible regardless of their records'
visibility.

With the backend running, `GET /api/gallery` returns public media records
without requiring login. After seeding a fresh database, it returns four items;
the two private records are excluded even when logged in as their owner.
The response contains metadata and relative file paths, not the image files.

`GET /api/gallery/mine` requires login and returns only the current user's
records, including private ones. Each seeded demo user has three entries:
two public and one private.

### Frontend

In a second terminal, create the local frontend configuration and start Vite:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend is normally available at `http://localhost:5173`.

With `VITE_API_BASE_URL` configured in `.env.local`, the gallery loads public
records from the backend. After seeding a fresh database, four images appear,
whether logged in or out. An unavailable backend displays an error; an empty
gallery displays an empty state.

After login, the app opens **My images**, the protected personal gallery.
Demo Alex sees samples 01-03 and Demo Sam sees samples 04-06. A newly registered
account has an empty personal gallery until image uploads are implemented.

Without `VITE_API_BASE_URL`, the gallery shows all six static sample images,
as in the GitHub Pages preview. Restart Vite after changing the configuration.

## License

This project is licensed under the [MIT License](LICENSE).
