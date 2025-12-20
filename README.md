# API HI

TypeScript/Express REST API that handles user management and authentication with JWTs, Prisma ORM, and PostgreSQL. The project is organized by feature with explicit service/repository layers so business logic stays separated from transport concerns.

## Tech Stack

- **Runtime**: Node.js 22+, pnpm
- **Framework**: Express 5 with middleware-based architecture
- **Database/ORM**: PostgreSQL + Prisma
- **Auth**: bcrypt for password hashing, jsonwebtoken for JWT-based authentication
- **Email**: Nodemailer for password reset emails
- **Logging**: Pino for structured JSON logging and audit trails
- **Security**: express-rate-limit for API protection
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
# Server Configuration
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
PORT=5050
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT Configuration
JWT_SECRET=super-secret
JWT_EXPIRATION=1h
SALT_ROUNDS=10

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Token Configuration
RESET_PASSWORD_TOKEN_EXPIRY=3600000
EMAIL_VERIFICATION_TOKEN_EXPIRY=86400000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,https://yourdomain.com
CORS_CREDENTIALS=true
```

> **Note for Gmail**: Use an App Password instead of your regular password. Enable 2FA and generate an App Password in Google Account Settings → Security → App passwords.

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
| `POST` | `/auth/register` | Register a new user and send verification email | Public | `registerUserSchema` |
| `POST` | `/auth/login` | Verify credentials and return JWT token | Public | - |
| `POST` | `/auth/logout` | Logout and log the event | Required | - |
| `POST` | `/auth/verify-email` | Verify email address using token from email | Public | `verifyEmailSchema` |
| `POST` | `/auth/resend-verification` | Resend verification email (rate limited: 3/10min) | Public | `resendVerificationSchema` |
| `POST` | `/auth/forgot-password` | Request password reset email (rate limited: 3/15min) | Public | `forgotPasswordSchema` |
| `POST` | `/auth/reset-password` | Reset password using token from email | Public | `resetPasswordSchema` |

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
- **`verifyEmailSchema`**: Validates email verification token
- **`resendVerificationSchema`**: Validates email for resending verification
- **`forgotPasswordSchema`**: Validates email for password reset requests
- **`resetPasswordSchema`**: Validates reset token and new password (min 8 chars, uppercase, lowercase, number)

All schemas include:
- Email format validation
- Username length constraints (3-30 chars)
- Display name length constraints (3-100 chars)
- Password length constraints (6-100 chars for regular, 8+ for reset with strength requirements)
- Automatic lowercase transformation for usernames and emails

## Middleware

- **`authMiddleware`** (`src/middleware/auth.middleware.ts`): JWT verification and user authentication
- **`validate`** (`src/middleware/validation.middleware.ts`): Zod schema validation for request body/params/query
- **`forgotPasswordLimiter`** (`src/middleware/rate-limit.middleware.ts`): Rate limiting for password reset (3 requests per 15 minutes)
- **`resendVerificationLimiter`** (`src/middleware/rate-limit.middleware.ts`): Rate limiting for resending verification emails (3 requests per 10 minutes)

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

- ✅ Password hashing with bcrypt (configurable salt rounds)
- ✅ JWT-based authentication with configurable expiration
- ✅ Email verification with secure token generation (24-hour expiry by default)
- ✅ Password reset with secure token generation (SHA-256 hashing, 1-hour expiry)
- ✅ Rate limiting on password reset and email verification endpoints
- ✅ Email enumeration prevention (same response for existing/non-existing emails)
- ✅ Comprehensive audit logging with Pino (15+ event types tracked)
- ✅ Request validation with Zod
- ✅ Environment variable configuration
- ✅ Unique constraints on username and email
- ✅ CORS with origin whitelisting and credentials support

## CORS Configuration

The API includes Cross-Origin Resource Sharing (CORS) support to allow requests from different origins (e.g., frontend applications).

### Configuration

CORS is configured via environment variables in `.env`:

```env
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,https://yourdomain.com

# Allow credentials (cookies, authorization headers)
CORS_CREDENTIALS=true
```

### Features

- **Origin Whitelisting**: Only specified origins can access the API
- **Dynamic Validation**: Origins are validated against the whitelist on each request
- **Credentials Support**: Allows sending cookies and authorization headers when enabled
- **Preflight Caching**: OPTIONS requests are cached for 24 hours to improve performance
- **Comprehensive Headers**: Supports common headers like `Content-Type`, `Authorization`, `X-Requested-With`

### Security Best Practices

> [!WARNING]
> **Production Security**
> - Never use `*` (wildcard) for `ALLOWED_ORIGINS` in production
> - Only add trusted domains to the whitelist
> - Use HTTPS for production origins (e.g., `https://yourdomain.com`)
> - Regularly audit the allowed origins list

> [!IMPORTANT]
> **Credentials Configuration**
> - Set `CORS_CREDENTIALS=true` only if you're using cookies or need to send authorization headers
> - When credentials are enabled, you cannot use wildcard origins
> - Frontend must include `credentials: 'include'` (fetch) or `withCredentials: true` (axios)

### Environment-Specific Setup

**Development:**
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
CORS_CREDENTIALS=true
```

**Production:**
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
CORS_CREDENTIALS=true
```

### Troubleshooting

**CORS Error: "No 'Access-Control-Allow-Origin' header"**
- Verify the origin is in `ALLOWED_ORIGINS`
- Check that CORS middleware is applied before routes in `src/app.ts`
- Ensure environment variables are loaded correctly

**Credentials Not Working:**
- Set `CORS_CREDENTIALS=true` in `.env`
- Frontend must send `credentials: 'include'` or `withCredentials: true`
- Origin must be specific (not `*`)

## Audit Logging

The API uses **Pino** for structured JSON logging with comprehensive audit trails:

**Logged Events:**
- User registration (success/failure)
- Login attempts (success/failure with reasons)
- Logout events
- Email verification (success/failure)
- Resend verification requests
- Password reset requests
- Password reset completions
- Profile updates
- User deletions
- Password changes

**Log Format:**
- Development: Pretty-printed colored output
- Production: Structured JSON for log aggregation services (Axiom, Logtail, Datadog)

**Example Log:**
```json
{
  "level": 30,
  "time": 1702890637123,
  "action": "user_login",
  "userId": 1,
  "email": "user@example.com",
  "msg": "User logged in successfully"
}
```

## Deployment Notes

- **Vercel/Node Runtime**: Requires a build step; compile with `tsc` to `dist/` and run `node dist/server.js`.
- **Prisma**: Needs a reachable PostgreSQL database and generated client files included in the deployment package.
- **Environment Variables**: Set all env vars via your hosting platform's settings.
- **Database Migrations**: Run `pnpm prisma migrate deploy` in production.

## Roadmap / TODO

- [ ] Add automated tests (unit + integration)
- [x] ~~Implement CORS configuration~~ ✅ **Completed**
- [ ] Set up production build script
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement refresh token rotation
- [x] ~~Add email verification flow~~ ✅ **Completed**
- [x] ~~Add password reset functionality~~ ✅ **Completed**
- [x] ~~Add rate limiting middleware~~ ✅ **Completed**
- [x] ~~Add audit logging~~ ✅ **Completed**
