# Local Community Problem Reporter (PWA)

A lightweight community reporting tool where residents can report local issues, follow progress, and confirm when fixes land. Built with React, TypeScript, Tailwind, and **Firebase** (Google Auth + Cloud Firestore, real-time). Without Firebase keys it falls back to a local demo mode.

## Features

- **Google sign-in (Firebase Auth)** with profile, points, levels, and badges with progress.
- **Create & edit reports** with category picker, photo upload (compressed in the browser and stored on the report — no Firebase Storage needed), and GPS location with a map.
- **Public feed** with search, status/category filters, sorting, and a "Following" view with **"N new" badges** for updates since your last visit.
- **Report pages** with a status progress bar, comments showing author names, official progress updates (reporter/admin only), share link, and map.
- **Status flow**: Open → Acknowledged → In Progress → Closed. Neighbours (not the reporter) confirm the fix.
- **Moderation**: flag/unflag, admin dashboard with Flagged / Hidden / Locked tabs, dismiss flags, hide, lock comments, mark duplicates (linked to the original), delete.
- **Owners** can edit or delete their own reports.
- **Mobile-first PWA**: bottom tab bar, installable app icons, offline app shell.

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

### Sample data

- **Demo mode** (no `.env`) starts with 13 example reports, 6 neighbours and comments. Reset or clear it in **Moderator HQ**.
- **Firebase mode**: sign in as an admin and click **🧪 Load sample data** (on the empty feed or in **Moderator HQ**). Reports are posted as you and tagged **Sample**; **Remove sample data** deletes them all. Edit the content in `src/data/sampleData.ts`.

### Data model

| Collection | Doc | Notes |
|---|---|---|
| `users/{uid}` | `name`, `avatar`, `role` | Created on first sign-in. |
| `reports/{id}` | title, description, category, status, location, coords, photoUrl (data URL), followers[], flaggedBy[], resolutionConfirmations[], hidden, commentsLocked, duplicateOf, createdAt, createdAtMs | Public read; writes validated in `firestore.rules`. |
| `updates/{id}` | reportId, userId, text, type (`comment`/`update`), createdAt, createdAtMs | Blocked when the report's comments are locked (except admins). |

### Deploy (optional)

```bash
npm run build
firebase deploy --only hosting
```
