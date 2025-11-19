# API HI

TypeScript/Express REST API that handles user management and authentication with JWTs, Prisma ORM, and PostgreSQL. The project is organized by feature with explicit service/repository layers so business logic stays separated from transport concerns.

## Tech Stack

- **Runtime**: Node.js 22+, pnpm
- **Framework**: Express 5 with middleware-based architecture
- **Database/ORM**: PostgreSQL + Prisma
- **Auth**: bcrypt for hashing, jsonwebtoken for access tokens
- **Language/Tooling**: TypeScript (strict), ts-node for dev, nodemon for live reload

## Project Structure

```
src/
├── app.ts                # Express app bootstrap
├── server.ts             # Starts HTTP server
├── config/               # env loader & Prisma client wrapper
├── controllers/          # HTTP handlers grouped by module + shared helpers
├── services/             # Business logic (auth/user) & mappers
├── repositories/         # Prisma data access per module
├── middleware/           # Cross-cutting middleware (JWT guard, etc.)
├── routes/               # Express routers mounted under /auth and /users
├── errors/               # Custom AppError type
└── types/                # Shared TS types & Express module augmentation
```

## Getting Started

### 1. Clone & Install

```bash
pnpm install
```

### 2. Environment Variables

Create `.env` (never commit it) with the required settings:

```
PORT=5050
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=super-secret
JWT_EXPIRATION=1h
```

### 3. Database & Prisma

1. Model updates live in `prisma/schema.prisma`.
2. Apply migrations: `pnpm prisma migrate dev` (for local) or `pnpm prisma db push` for quick sync.
3. Generate the Prisma client (needed whenever the schema changes): `pnpm prisma generate`. Output lands in `generated/prisma`.

### 4. Development

```bash
pnpm dev
```

Runs nodemon + ts-node in ESM mode, recompiling on changes. The API listens on `PORT` from the env file (defaults to `5050`).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the API in watch mode with ts-node |
| `pnpm prisma migrate dev` | Create/apply migrations and regenerate Prisma client |
| `pnpm prisma generate` | Regenerate Prisma client manually |
| `pnpm lint` / `pnpm test` | _Not configured yet_ (add when ready) |

> ❗ **Production build**: the repo currently runs via ts-node; add a `tsc` build + `start` script before deploying to environments like Vercel/Node runtime functions.

## API Surface

All endpoints respond with `{ status, message, data? }` JSON payloads.

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Register and store a user (hashing password) | Public |
| `POST` | `/auth/login` | Verify credentials and return `{ user, token }` | Public |
| `POST` | `/auth/logout` | Stateless acknowledgment | Public |
| `POST` | `/users` | Create a user (admin-style) | Public (adjust as needed) |
| `GET` | `/users` | List users | Requires `Authorization: Bearer <token>` |
| `GET` | `/users/:id` | Fetch a user by id | Requires token |
| `PUT` | `/users/:id` | Update user fields | Requires token |
| `DELETE` | `/users/:id` | Remove a user | Requires token |

`src/middleware/accessValidation.ts` handles JWT verification and attaches `req.userData` for downstream controllers.

## Adding New Modules

1. **Plan the data shape** (Prisma model, DTOs, response contract).
2. **Create routes** under `src/routes/<module>.routes.ts` and mount them in `src/routes/index.ts`.
3. **Implement controllers** (validation + DTO parsing) in `src/controllers/<module>/`.
4. **Add services** in `src/services/<module>/` and reuse `AppError` for controlled failures.
5. **Create repositories** talking to Prisma in `src/repositories/<module>/`.
6. **Add middleware/types** if you need new guards or request data.
7. **Update docs/tests** and run the dev server to smoke-test.

## Deployment Notes

- Vercel’s Node runtime expects a build step; consider compiling with `tsc` to `dist/` and running `node dist/server.js`.
- Prisma needs a reachable PostgreSQL database and generated client files included in the deployment package.
- Set all env vars via Vercel Project Settings.

## Roadmap / TODO

- Add input validation (e.g., Zod or class-validator).
- Implement automated tests (unit + integration).
