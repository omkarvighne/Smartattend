# SmartAttend — Attendance Management Platform

A multi-part attendance-management application with a **Next.js web frontend**, **FastAPI backend**, and **Expo / React Native mobile app**. The source includes role-specific screens for students, teachers, and administrators, alongside QR-based attendance flows.

> **Project status:** Development/prototype repository. Do not assume that face verification is production-ready: the frontend documentation explicitly describes a mock face-embedding flow. Test locally and review security before any real student deployment.

## Stack

| Component | Technologies |
| --- | --- |
| Web | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query, Recharts |
| API | Python, FastAPI, SQLAlchemy, PostgreSQL, JWT authentication |
| Mobile | Expo SDK 54, React Native, Expo Router, TypeScript |
| Attendance | QR-code sessions, attendance records, face-verification-related code (see limitations) |

## Project layout

```text
smartattend-frontend/    # Next.js web dashboards and attendance UI
smartattend-backend/     # FastAPI endpoints, models, services and seed script
smartattend-mobile/      # Expo mobile application
```

## What the code covers

- Role-based web dashboards for students, teachers, and administrators
- Attendance sessions with expiring signed QR tokens
- Student, teacher, course, and attendance API endpoints
- Attendance records, charts, alerts, and reporting screens
- Mobile login, profile, and scanning screens

Some flows may be incomplete or demonstration-only. In particular, do not represent the face verification UI as a tested biometric security system.

## Local setup

### 1. Backend

Create a PostgreSQL database and make its connection URL available as `DATABASE_URL`. Choose a **new, random** `SECRET_KEY`. From the repository root:

```bash
cd smartattend-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows, activate with `.venv\Scripts\activate`.

Create `smartattend-backend/.env` locally (never commit real secrets):

```dotenv
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/smartattend
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` and interactive documentation is available at `http://localhost:8000/docs`. The backend initializes tables at startup. An optional demo-data seed script exists at `smartattend-backend/seed.py`; inspect it before running because it creates example accounts with predictable passwords.

### 2. Web frontend

Open another terminal:

```bash
cd smartattend-frontend
npm install
```

Create your own `smartattend-frontend/.env.local` and set:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Mobile app

```bash
cd smartattend-mobile
npm ci
npx expo start
```

Use an Expo-compatible development environment. Configure the mobile API base URL for your emulator or physical device; `localhost` on a phone refers to the phone, not your computer.

## Security and known limitations

- **Do not deploy as-is.** Review CORS settings, JWT configuration, database access, demo credentials, and authentication/attendance flows.
- Some face-recognition paths are mocked or experimental; do not present them as verified identity protection.
- The repository currently contains generated Python cache files, Expo metadata, and a tracked frontend `.env.local`. Review these before publishing a production version and rotate any credentials that were ever committed.
- QR attendance does not by itself guarantee location or identity verification.

## Portfolio improvements planned

Add verified screenshots, a short demonstration video, test instructions, an architecture diagram, and a clearly identified list of implemented versus planned features.

## Maintainer

[Omkar Vighne](https://github.com/omkarvighne)
