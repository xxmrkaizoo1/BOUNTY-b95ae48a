# Local Community Problem Reporter (PWA)

A lightweight community reporting tool where residents can report local issues, follow progress, and confirm when fixes land. Built with React, TypeScript, Tailwind, and **Firebase** (Google Auth + Cloud Firestore, real-time). Without Firebase keys it falls back to a local demo mode.

## Features

- **Google sign-in (Firebase Auth)** with profile details, points, and badges.
- **Create reports** with title, description, category, photo URL, and location.
- **Public feed + detail pages** with status flow: Open → Acknowledged → In Progress → Closed.
- **Follow system** with auto-follow on report creation.
- **Gamification** (points + badges): First Report, Helper (5 updates/comments), Resolver (2 confirmed resolutions).
- **Public updates/comments** with light rate limiting and community confirmations on closures.
- **Search + filters** by status and category.
- **Moderation tools**: flag reports, hide/unhide reports, lock comments, and admin dashboard view.
- **Duplicate handling** (admin-only) to redirect reports.
- **PWA ready** with manifest + service worker cache.

## Setup

```bash
cd community-reporter
npm install
npm run dev
```

With no `.env`, the app runs in **demo mode** (mock users, data saved in localStorage).

## Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method** → enable **Google**.
3. **Firestore Database** → create a database (production mode).
4. **Project settings → Your apps** → add a **Web app**, then copy its config into `community-reporter/.env`:
   ```bash
   cp .env.example .env   # then fill in the VITE_FIREBASE_* values
   ```
5. Deploy the security rules (once, and whenever `firestore.rules` changes):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # pick your project
   firebase deploy --only firestore:rules
   ```
6. Restart `npm run dev` and sign in with Google.

### Making someone an admin

Admins can hide reports, lock comments, mark duplicates and change any report's status. After a user signs in once, open **Firestore → `users/{uid}`** in the console and change `role` from `member` to `admin`, then have them sign out/in. Users can't change their own role (enforced by the rules).

### Data model

| Collection | Doc | Notes |
|---|---|---|
| `users/{uid}` | `name`, `avatar`, `role` | Created on first sign-in. |
| `reports/{id}` | title, description, category, status, location, photoUrl, followers[], flaggedBy[], resolutionConfirmations[], hidden, commentsLocked, duplicateOf, createdAt, createdAtMs | Public read; writes validated in `firestore.rules`. |
| `updates/{id}` | reportId, userId, text, type (`comment`/`update`), createdAt, createdAtMs | Blocked when the report's comments are locked (except admins). |

### Deploy (optional)

```bash
npm run build
firebase deploy --only hosting
```
