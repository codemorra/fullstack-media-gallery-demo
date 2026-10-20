# Fullstack Media Gallery Demo

A learning and portfolio project built with React and FastAPI. Work in progress.

[Live frontend preview](https://codemorra.github.io/fullstack-media-gallery-demo/)

GitHub Pages hosts a static frontend preview with sample images.
Accounts and image management require running the frontend and backend locally.

## Features

- Public gallery and personal image collections
- Registration, login, and session-based authentication
- Image uploads with public/private visibility, editing, and deletion
- Uploader attribution, enlarged image views, and light/dark themes

**Frontend:** React, TypeScript, Tailwind CSS, React Router, Vite

**Backend:** FastAPI, SQLite, SQLAlchemy, Alembic, Pillow

## Run locally

Requires Python and Node.js with npm. Commands below use a Linux/macOS shell.

### Backend

From the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Set a random `SESSION_SECRET` in `backend/.env`.
Keep `FRONTEND_ORIGIN=http://localhost:5173` for the default local setup.

```bash
alembic upgrade head
python -m uvicorn app.main:app --reload
```

API: `http://localhost:8000` ·
[Interactive API docs](http://localhost:8000/docs)

### Frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173`. The example configuration sets
`VITE_API_BASE_URL=http://localhost:8000`; restart Vite after changing it.

### Demo data (optional)

From `backend/`, with the virtual environment activated:

```bash
python -m app.seed
```

Choose a password of 10–128 characters for the demo accounts:
`demo.alex@example.com` and `demo.sam@example.com`.

The seed creates six image records: four public and two private, with three
assigned to each account. Running it again preserves existing records.
The sample files in `frontend/public/` remain publicly accessible.

## Usage

Browse shared images in **Gallery**. After login, use **My images** to upload
JPEG, PNG, or WebP files (up to 10 MiB and 20 million pixels). Choose visibility
during upload; the default is private. Use **Edit** to change a title or
visibility, and **Delete** to remove an image.

Pillow converts uploads to WebP in `backend/uploads/`. Private uploaded images
are accessible only to their owner. Click an image to open the enlarged view.

Frontend checks, from `frontend/`: `npm run build` and `npm run lint`.

## License

This project is licensed under the [MIT](LICENSE). Sample photos: © Christopher Kranz.
