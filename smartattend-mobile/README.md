# SmartAttend AI — Mobile App (React Native + Expo)

Android & iOS app for students to scan QR codes and mark attendance with face verification.

## Stack

| Package | Purpose |
|---------|---------|
| Expo 51 | Build & dev tooling |
| Expo Router | File-based navigation |
| Expo Camera | QR scanning + face capture |
| Expo Barcode Scanner | QR code detection |
| Expo Secure Store | JWT token storage (secure keychain) |
| Expo Haptics | Vibration feedback on scan |
| Expo Linear Gradient | UI gradients |
| Zustand | Auth state management |
| TanStack Query | API data fetching |
| Axios | HTTP client with JWT interceptors |

## Screens

```
/login                  Login screen (all roles)
/(tabs)/index           Dashboard — attendance summary + course bars
/(tabs)/scan            QR Scanner → Face verification → Success/Fail
/(tabs)/attendance      Full attendance history timeline
/(tabs)/profile         Profile, face enroll link, logout
```

## Quick Start

### 1. Install Expo CLI

```bash
npm install -g expo-cli eas-cli
```

### 2. Install dependencies

```bash
cd smartattend-mobile
npm install
```

### 3. Set your backend IP

Open `src/lib/api.ts` and change the API_URL to your Mac's local IP:

```typescript
const API_URL = 'http://192.168.1.100:8000/api/v1'
//                        ^^^^^^^^^^^^ your Mac's IP
```

To find your Mac's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Make sure your phone and Mac are on the **same WiFi network**.

### 4. Also update frontend URL in backend .env

```bash
# smartattend-backend/.env
FRONTEND_URL=http://192.168.1.100:3000
```

This makes the QR code encode the right URL so your phone opens it directly.

### 5. Run on Android

**Option A — Expo Go app (fastest, no build needed):**
```bash
npx expo start
```
Scan the QR code shown in terminal with the **Expo Go** app (download from Play Store).

**Option B — Build APK (standalone, no Expo Go needed):**
```bash
# Login to Expo account (free)
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```
This gives you a downloadable `.apk` you can install directly on any Android phone.

### 6. Run on iOS (Mac only)

```bash
npx expo start --ios
```

## How QR → App flow works on phone

1. Teacher starts session in web dashboard → QR encodes:
   `http://192.168.1.100:3000/attendance/mark?token=<JWT>`

2. Student opens phone camera → scans QR → browser opens the URL

3. **If logged in on browser**: token auto-fills, face verification starts

4. **In the native app**: go to Scan tab → camera opens → scan QR → face verification → done

## Building for production (APK/AAB)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build production APK
eas build --platform android

# Build for Google Play Store (AAB)
eas build --platform android --profile production
```

### eas.json (create this file for build profiles)

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Phase 2 — Real Face Verification

Replace the mock embedding in `app/(tabs)/scan.tsx`:

```typescript
import * as FaceDetector from 'expo-face-detector'

// After camera captures a frame:
const { faces } = await FaceDetector.detectFacesAsync(photoUri, {
  mode: FaceDetector.FaceDetectorMode.accurate,
  detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
})

// Send frame to backend for DeepFace embedding extraction:
const formData = new FormData()
formData.append('image', { uri: photoUri, type: 'image/jpeg', name: 'face.jpg' })
const { data } = await api.post('/face/embed', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
const embedding = data.embedding  // 512-dim array from DeepFace
```

## Project structure

```
smartattend-mobile/
├── app/
│   ├── _layout.tsx         Root layout + providers
│   ├── index.tsx           Auth redirect
│   ├── login.tsx           Login screen
│   └── (tabs)/
│       ├── _layout.tsx     Bottom tab navigator
│       ├── index.tsx       Dashboard
│       ├── scan.tsx        QR Scanner + Face verify
│       ├── attendance.tsx  History
│       └── profile.tsx     Profile + logout
├── src/
│   ├── lib/
│   │   ├── api.ts          Axios client + all API calls
│   │   └── theme.ts        Colors, fonts, shadows
│   └── store/
│       └── authStore.ts    Zustand auth store (SecureStore)
├── app.json                Expo config
├── babel.config.js
└── package.json
```
