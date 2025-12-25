# Environment Variables (`.env`)

This backend reads configuration from `server/.env`.

- You can start by copying [server/.env.example](./.env.example) → `server/.env`.
- Do **not** commit `server/.env` to git.

## Required

### `PORT`
- **What**: Port where the API server will run.
- **Example**: `PORT=5000`

### `NODE_ENV`
- **What**: Runtime mode.
- **Allowed**: `development` | `production`
- **Example**: `NODE_ENV=development`

### `MONGO_URI`
- **What**: MongoDB connection string.
- **Example (local)**: `MONGO_URI=mongodb://localhost:27017/student-tracker`

### `JWT_SECRET`
- **What**: Secret key used to sign/verify JWT tokens.
- **Important**: Set a long random string in production.
- **Example**: `JWT_SECRET=change_me`

### `JWT_ACCESS_SECRET` (optional)
- **What**: Secret used to sign/verify access tokens.
- **If omitted**: Falls back to `JWT_SECRET`.

### `JWT_REFRESH_SECRET` (optional)
- **What**: Secret used to sign/verify refresh tokens.
- **If omitted**: Falls back to `JWT_SECRET`.

## Optional (Integrations)

These are optional. The backend works without them, but some integration endpoints may return limited data.

### `GITHUB_TOKEN`
- **What**: A GitHub personal access token used to avoid rate limits and access GitHub API more reliably.
- **Needed for**: `/api/integrations/github/:username` and `/api/integrations/sync` (GitHub part)
- **Example**: `GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Notes:
- Public data can be fetched without a token, but GitHub rate limits are much lower.

### LinkedIn / Medium
- No environment variables are required.
- Students provide profile links in their user profile:
  - `linkedinUrl` (example: `https://www.linkedin.com/in/your-slug/`)
  - `mediumUrl` (example: `https://medium.com/@yourname`)

## Example `.env`

```bash
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/student-tracker
JWT_SECRET=change_me

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GITHUB_TOKEN=

```

## Troubleshooting

- If the server can’t connect to MongoDB, double-check `MONGO_URI` and that MongoDB is running.
- If protected routes return `Not authorized, token failed`, make sure:
  - `JWT_SECRET` didn’t change after you created the token
  - you are sending `Authorization: Bearer <TOKEN>`
