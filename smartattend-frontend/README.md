# SmartAttend AI — Frontend

Next.js 14 frontend for the SmartAttend AI platform. Built with TypeScript, Tailwind CSS, Framer Motion, and Recharts.

## Stack

| Package | Purpose |
|---------|---------|
| Next.js 14 | App router, SSR, routing |
| TypeScript | Type safety |
| Tailwind CSS | Utility styling |
| Framer Motion | Animations & page transitions |
| Zustand | Auth state |
| TanStack Query | Server state, caching |
| Recharts | Charts & analytics |
| React Hook Form + Zod | Forms & validation |
| next-themes | Light/dark mode |
| react-hot-toast | Toast notifications |
| Axios | HTTP client with JWT interceptors |

## Pages

```
/                           Landing page
/auth/login                 Login (all roles)

/dashboard/teacher          Teacher dashboard
/dashboard/teacher/session  Start QR session (live counter)
/dashboard/teacher/records  Attendance records table
/dashboard/teacher/analytics  Charts & trends
/dashboard/teacher/defaulters  Defaulter management
/dashboard/teacher/reports  Download PDF/Excel/CSV

/dashboard/student          Student dashboard
/dashboard/student/attendance  Full attendance history
/dashboard/student/alerts   Attendance warnings
/dashboard/student/face-enroll  Face enrollment

/dashboard/admin            Admin dashboard
/dashboard/admin/students   Student management
/dashboard/admin/teachers   Teacher management (card grid)
/dashboard/admin/courses    Course management

/attendance/mark            Mark attendance (QR + face flow)
```

## Quick start

```bash
cd smartattend-frontend
npm install
cp .env.local .env.local   # already set to localhost:8000
npm run dev
```

Open http://localhost:3000

Make sure the backend is running on http://localhost:8000.

## Design system

All design tokens are in `src/styles/globals.css` as Tailwind components:

- `.btn`, `.btn-primary`, `.btn-gradient` — buttons
- `.card`, `.card-hover` — cards
- `.stat-card`, `.stat-value` — metric cards
- `.badge`, `.badge-green`, `.badge-red`, `.badge-amber` — badges
- `.input`, `.label`, `.form-group` — form elements
- `.table`, `.table-wrapper` — tables
- `.sidebar-item` — nav items
- `.gradient-text` — indigo→purple gradient text
- `.progress-bar`, `.progress-fill` — progress bars

## Connect to backend

All API calls are in `src/lib/api.ts`. The axios instance:
- Automatically attaches JWT from localStorage
- Auto-refreshes tokens on 401
- Redirects to /auth/login on auth failure

To point to a different backend: change `NEXT_PUBLIC_API_URL` in `.env.local`.

## Adding a new page

1. Create `src/app/dashboard/<role>/<page>/page.tsx`
2. Add it to the nav array in `src/app/dashboard/layout.tsx`
3. Add an API function to `src/lib/api.ts` if needed
4. Use `useQuery` from TanStack Query to fetch data

## Phase 2: Real face verification

Replace the mock embedding in `src/app/attendance/mark/page.tsx`:

```typescript
// Instead of:
const mockEmbedding = Array.from({ length: 512 }, () => Math.random() * 2 - 1)

// Use face-api.js or send frame to your backend:
import * as faceapi from 'face-api.js'
await faceapi.loadSsdMobilenetv1Model('/models')
await faceapi.loadFaceLandmark68Model('/models')
await faceapi.loadFaceRecognitionModel('/models')
const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor()
const embedding = Array.from(detections.descriptor) // 128-dim Float32Array
```
