# Fullstack Media Gallery Demo

A small learning and portfolio project for building a fullstack media gallery. It is intentionally kept simple while I learn and document the individual steps.

## Live preview

[Open the static frontend preview](https://codemorra.github.io/fullstack-media-gallery-demo/)

GitHub Pages hosts only the static frontend. The public sample gallery is
available, while registration, login, logout, the personal gallery, and image
uploads require a backend.

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
- authenticated image uploads with Pillow validation and WebP conversion
- image file access restricted by visibility and ownership
- owner-only title editing, visibility changes, and image deletion
- uploader attribution and visibility selection when uploading images

Downloads in different resolutions and further visual polish are planned for
later iterations.

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

The demo image files in `frontend/public/` remain publicly accessible regardless
of their database records' visibility. Newly uploaded files are stored separately
and have access checks when retrieved through the backend.

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
account starts with an empty personal gallery and can add images using the
upload form.

Without `VITE_API_BASE_URL`, the gallery shows all six static sample images,
as in the GitHub Pages preview. Restart Vite after changing the configuration.

### Image uploads

Run both applications, log in, and open **My images**. Choose **Upload image**
to open the upload dialog. Enter a title, select a JPEG, PNG, or WebP file,
and choose **Private — only you** (the default) or **Public — everyone**.
Click **Upload image** to save the image. It appears immediately in the personal
gallery; public uploads also appear in the public gallery.

Uploads are limited to 10 MiB and 20 million pixels. Animated images are not
supported. Pillow validates the actual image contents, applies EXIF orientation,
and saves a new WebP file without the original metadata. The original file is
not retained.

Files are stored in `backend/uploads/`, which is created automatically and
ignored by Git. The frontend loads backend images through
`GET /api/media/{id}/file`: public images are accessible without login, while
private images require their owner's session. The upload endpoint is
`POST /api/media`, accepting `title`, `file`, and optional `visibility` as
multipart form fields. Omitting `visibility` keeps the image private.

### Managing images

In **My images**, choose **Edit** on an image card to change its title or
visibility, then **Save changes**. Public images appear in the public gallery;
private uploads are accessible only to their owner. Choose **Delete** and confirm
with **Delete permanently** to remove an image. Successful changes appear
immediately in the personal gallery.

Click an image to open a larger, uncropped view. Close dialogs with the close
button or Escape; pending uploads and changes must finish before dismissal.

Image cards and the enlarged view show **Uploaded by …** using the uploader's
username from the API, not their email. The static sample preview has no user
assignment. The six sample photos show their copyright notice in the bottom-right
corner of the image; uploader
attribution does not imply copyright ownership.

The backend checks ownership for both `PATCH /api/media/{id}` and
`DELETE /api/media/{id}`. Deleting an uploaded image removes its database record
and, when no other record references it, its stored file. Shared demo image
files are kept. A file cleanup failure is logged after the database record is
deleted; the file is then no longer accessible through the media endpoint.

## License

This project is licensed under the [MIT License](LICENSE).
