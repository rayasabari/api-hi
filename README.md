# API HI

TypeScript/Express REST API that handles user management and authentication with JWTs, Prisma ORM, and PostgreSQL. The project is organized by feature with explicit service/repository layers so business logic stays separated from transport concerns.

## Tech Stack

- **Runtime**: Node.js 22+, pnpm
- **Framework**: Express 5 with middleware-based architecture
- **Database/ORM**: PostgreSQL + Prisma
- **Auth**: bcrypt for password hashing, jsonwebtoken for JWT-based authentication
- **Validation**: Zod for request validation with custom schemas
- **Language/Tooling**: TypeScript (strict mode), tsx for development with hot reload

## Project Structure

```
src/
├── app.ts                # Express app bootstrap
├── server.ts             # Starts HTTP server
├── config/               # Environment loader & Prisma client wrapper
├── controllers/          # HTTP handlers grouped by module + shared helpers
├── services/             # Business logic (auth/user) & mappers
├── repositories/         # Prisma data access per module
├── middleware/           # Cross-cutting middleware (auth, validation)
├── routes/               # Express routers mounted under /auth and /users
├── validations/          # Zod schemas for request validation
├── errors/               # Custom AppError type & error utilities
├── utils/                # Shared utilities (password, string, Zod helpers)
└── types/                # Shared TS types & Express module augmentation
```

## Getting Started

### 1. Clone & Install

```bash
pnpm install
```

### 2. Environment Variables

Create `.env` (never commit it) with the required settings:

```env
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

Runs tsx in watch mode, recompiling on changes. The API listens on `PORT` from the env file (defaults to `5050`).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the API in watch mode with tsx |
| `pnpm prisma migrate dev` | Create/apply migrations and regenerate Prisma client |
| `pnpm prisma generate` | Regenerate Prisma client manually |
| `pnpm prisma db push` | Quick sync schema to database without migrations |
| `pnpm test` | _Not configured yet_ (add when ready) |

> ❗ **Production build**: The repo currently runs via tsx; add a `tsc` build + `start` script before deploying to production environments like Vercel/Node runtime functions.

## API Endpoints

All endpoints respond with `{ status, message, data? }` JSON payloads.

### Authentication Routes (`/auth`)

| Method | Path | Description | Auth | Validation |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Register a new user with hashed password | Public | `registerUserSchema` |
| `POST` | `/auth/login` | Verify credentials and return JWT token | Public | - |
| `POST` | `/auth/logout` | Stateless logout acknowledgment | Public | - |

### User Routes (`/users`)

| Method | Path | Description | Auth | Validation |
| --- | --- | --- | --- | --- |
| `POST` | `/users` | Create a user (admin-style) | Required | `createUserSchema` |
| `GET` | `/users` | List all users | Required | - |
| `GET` | `/users/:id` | Fetch a user by ID | Required | - |
| `PUT` | `/users/:id` | Update user fields (username, email, displayName) | Required | `updateUserSchema` |
| `PATCH` | `/users/password` | Update current user's password | Required | `updatePasswordSchema` |
| `DELETE` | `/users/:id` | Remove a user | Required | - |

**Auth Required**: Endpoints require `Authorization: Bearer <token>` header.

## Validation Schemas

The API uses Zod for request validation with the following schemas:

- **`registerUserSchema`**: Validates user registration (username, email, displayName, password)
- **`createUserSchema`**: Validates user creation (username, email, displayName)
- **`updateUserSchema`**: Validates user updates (partial fields)
- **`updatePasswordSchema`**: Validates password changes (currentPassword, newPassword, confirmPassword)

All schemas include:
- Email format validation
- Username length constraints (3-30 chars)
- Display name length constraints (3-100 chars)
- Password length constraints (6-100 chars)
- Automatic lowercase transformation for usernames and emails

## Middleware

- **`authMiddleware`** (`src/middleware/auth.middleware.ts`): JWT verification and user authentication
- **`validate`** (`src/middleware/validation.middleware.ts`): Zod schema validation for request body/params/query

## Adding New Modules

1. **Plan the data shape** (Prisma model, DTOs, response contract).
2. **Create Zod schemas** in `src/validations/<module>.validation.ts` for request validation.
3. **Create routes** under `src/routes/<module>.routes.ts` and mount them in `src/routes/index.ts`.
4. **Implement controllers** (validation + DTO parsing) in `src/controllers/<module>.controller.ts`.
5. **Add services** in `src/services/<module>.service.ts` and reuse `AppError` for controlled failures.
6. **Create repositories** talking to Prisma in `src/repositories/<module>.repository.ts`.
7. **Add middleware/types** if you need new guards or request data.
8. **Update docs/tests** and run the dev server to smoke-test.

## Error Handling

The API uses a custom `AppError` class for controlled error handling:
- Consistent error responses across all endpoints
- HTTP status code mapping
- Detailed error messages for debugging

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Request validation with Zod
- ✅ Environment variable configuration
- ✅ Unique constraints on username and email
- ⚠️ CORS not configured (add if needed)
- ⚠️ Rate limiting not implemented (add for production)

## Deployment Notes

- **Vercel/Node Runtime**: Requires a build step; compile with `tsc` to `dist/` and run `node dist/server.js`.
- **Prisma**: Needs a reachable PostgreSQL database and generated client files included in the deployment package.
- **Environment Variables**: Set all env vars via your hosting platform's settings.
- **Database Migrations**: Run `pnpm prisma migrate deploy` in production.

## Roadmap / TODO

- [ ] Add automated tests (unit + integration)
- [ ] Implement CORS configuration
- [ ] Add rate limiting middleware
- [ ] Set up production build script
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement refresh token rotation
- [ ] Add email verification flow
- [ ] Add password reset functionality
