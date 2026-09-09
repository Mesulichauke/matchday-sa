# Matchday SA

Matchday SA uses a self-hosted Express API and SQLite database for authentication, consultant approvals, sessions, audit logs, and booking requests. Clerk and Convex are not required.

## Run locally

1. Copy `.env.example` to `.env` and set a long, unique `ADMIN_PASSWORD` (and the other admin values).
2. Install dependencies: `npm install`
3. Start the API: `npm run api`
4. In another terminal start the frontend: `npm run dev`

`npm run dev:full` starts both processes when `concurrently` is available. Vite proxies `/api` to `http://localhost:3001`; set `APP_ORIGIN` to the public frontend origin in production. Set `NODE_ENV=production` to enable the Secure session cookie.

For GitHub Pages, deploy `server/index.mjs` and its SQLite database to your own HTTPS VPS. Set the GitHub Actions repository variable `VITE_API_BASE_URL` to that API origin (for example, `https://api.example.com`) and configure the API's `APP_ORIGIN` to `https://mesulichauke.github.io`. For a separate GitHub Pages origin, set the API's `COOKIE_SAMESITE` to `none` and use HTTPS so the secure session cookie can be sent. GitHub Pages cannot run the Express API itself.

### Temporary Render deployment

The repository includes `render.yaml` for a temporary test deployment:

1. Create a Render account and choose **New → Blueprint**.
2. Connect this repository and select the `render.yaml` blueprint.
3. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` when prompted.
4. Deploy and copy the generated service URL, such as `https://matchday-sa-api.onrender.com`.
5. Add that URL as the GitHub repository Actions variable `VITE_API_BASE_URL`.
6. Re-run the GitHub Pages workflow.

The free Render service may sleep and its local SQLite database is not durable. Use it for testing only; move to a persistent database and VPS before production.

The first API start creates the administrator from `ADMIN_*` only when that email is not already present. Passwords are salted `scrypt` hashes, sessions are random tokens stored server-side in SQLite, and mutating API requests are restricted to configured same-origin requests.

Consultants apply at `/auth?mode=signup`, wait for approval, then sign in. Administrators use `/auth?mode=admin` to review, approve, reject, or revoke consultant applications.
