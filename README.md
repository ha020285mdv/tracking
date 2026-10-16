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

**Terminal 1 — Frontend (Angular):**

```bash
npm start
```

→ Opens at http://localhost:4200

**Terminal 2 — Backend (Firebase Functions):**

```bash
cd functions
npm run build
firebase emulators:start --only functions
```

→ API at http://127.0.0.1:5001/easyworkouttrack/europe-west1/api  
→ Emulator UI at http://127.0.0.1:4000

---

## Other Commands

| Command                        | Description              |
| ------------------------------ | ------------------------ |
| `npm run build`                | Build for production     |
| `npm test`                     | Run unit tests           |
| `ng generate component <name>` | Generate a new component |

## Additional Resources

- [Angular CLI Docs](https://angular.dev/tools/cli)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
