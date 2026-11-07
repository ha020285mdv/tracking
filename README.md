# TrackingApp

A workout tracking application built with Angular 20 and Firebase.

## Quick Start

### Prerequisites

- Node.js (v20+)
- Firebase CLI: `npm install -g firebase-tools`
- Firebase login: `firebase login`

### 1. Install Dependencies

```bash
# Frontend (root folder)
npm install

# Backend (functions folder)
cd functions && npm install
```

### 2. Start Dev Servers

**Option A: Full Local Development (Recommended)**

Uses local Firebase emulators for both Functions and Firestore:

```bash
# Terminal 1 — Backend (Firebase Emulators)
cd functions
npm run build
firebase emulators:start

# Terminal 2 — Frontend (Angular with local config)
npm run start:local
```

→ Angular app at http://localhost:4200  
→ API at http://127.0.0.1:5001/easyworkouttrack/europe-west1/api  
→ Emulator UI at http://127.0.0.1:4000

**Option B: Frontend Only (uses deployed backend)**

```bash
npm start
```

→ Opens at http://localhost:4200 (connects to production API)

---

## NPM Scripts

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm start`           | Start Angular dev server (uses deployed backend) |
| `npm run start:local` | Start Angular with local emulator backend        |
| `npm run build`       | Build for production                             |
| `npm test`            | Run unit tests                                   |

## Additional Resources

- [Angular CLI Docs](https://angular.dev/tools/cli)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Emulators Docs](https://firebase.google.com/docs/emulator-suite)
