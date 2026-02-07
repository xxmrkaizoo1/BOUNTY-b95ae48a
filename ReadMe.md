# Local Community Problem Reporter (PWA)

A lightweight community reporting tool where residents can report local issues, follow progress, and confirm when fixes land. Built with React, TypeScript, Tailwind, and a simple in-memory data layer to demonstrate flows quickly.

## Features

- **Google sign-in (mock)** with profile details, points, and badges.
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
npm install
npm run dev
