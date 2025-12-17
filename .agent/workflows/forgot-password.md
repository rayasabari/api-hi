---
description: Workflow untuk menambahkan fitur Forgot Password / Reset Password
---

# Workflow: Implementasi Fitur Forgot Password / Reset Password

Workflow ini memberikan panduan step-by-step untuk menambahkan fitur forgot password / reset password ke dalam API.

## Prerequisites

- Database PostgreSQL sudah running
- Email service (untuk mengirim email reset password)
- Environment variables sudah dikonfigurasi

---

## Step 1: Update Database Schema

### 1.1 Tambahkan field untuk reset token di Prisma Schema

Edit file `prisma/schema.prisma` dan tambahkan field berikut ke model User:

```prisma
model User {
  id                    Int       @id @default(autoincrement())
  username              String    @unique @db.VarChar(255)
  displayName           String    @db.VarChar(255)
  password              String?   @db.VarChar(255)
  email                 String    @unique @db.VarChar(255)
  resetPasswordToken    String?   @db.VarChar(255)
  resetPasswordExpires  DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @default(now()) @updatedAt
}
```

**Penjelasan:**
- `resetPasswordToken`: Menyimpan token unik untuk reset password
- `resetPasswordExpires`: Menyimpan waktu kadaluarsa token (biasanya 1 jam)

### 1.2 Generate dan jalankan migration

```bash
npx prisma migrate dev --name add-reset-password-fields
```

---

## Step 2: Setup Email Service

### 2.1 Install dependencies untuk email

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### 2.2 Tambahkan environment variables

Tambahkan ke file `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Reset Password Configuration
RESET_PASSWORD_TOKEN_EXPIRY=3600000
FRONTEND_URL=http://localhost:3000
```

**Catatan:** 
- Untuk Gmail, gunakan App Password bukan password biasa
- `RESET_PASSWORD_TOKEN_EXPIRY` dalam milliseconds (3600000 = 1 jam)

### 2.3 Update config/env.ts

Tambahkan validasi untuk environment variables email:

```typescript
export const env = {
  // ... existing config
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587'),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@app.com',
  RESET_PASSWORD_TOKEN_EXPIRY: parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY || '3600000'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
```

### 2.4 Buat Email Service

Buat file `src/services/email.service.ts`:

```typescript
import nodemailer from 'nodemailer';
import { env } from '../config/env.ts';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset Password Request',
    html: `
      <h1>Reset Password</h1>
      <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password.</p>
      <p>Silakan klik link berikut untuk reset password Anda:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Link ini akan kadaluarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const emailService = {
  sendResetPasswordEmail,
};

export default emailService;
```

---

## Step 3: Buat Utility untuk Generate Token

### 3.1 Buat file utils/token-utils.ts

```typescript
import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

**Penjelasan:**
- `generateResetToken()`: Generate random token
- `hashToken()`: Hash token sebelum disimpan di database (untuk keamanan)

---

## Step 4: Update User Repository

### 4.1 Tambahkan method di user.repository.ts

Tambahkan method berikut ke `src/repositories/user.repository.ts`:

```typescript
const saveResetToken = async (
  email: string,
  hashedToken: string,
  expiresAt: Date
) => {
  return await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    },
  });
};

const findByResetToken = async (hashedToken: string) => {
  return await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(), // Token belum kadaluarsa
      },
    },
  });
};

const clearResetToken = async (userId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
};

// Export di userRepository object
const userRepository = {
  // ... existing methods
  saveResetToken,
  findByResetToken,
  clearResetToken,
};
```

---

## Step 5: Update Auth Service

### 5.1 Tambahkan method di auth.service.ts

Tambahkan method berikut ke `src/services/auth.service.ts`:

```typescript
import emailService from './email.service.ts';
import { generateResetToken, hashToken } from '../utils/token-utils.ts';
import { env } from '../config/env.ts';

const forgotPassword = async (email: string) => {
  // Cari user berdasarkan email
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    // Jangan beritahu user bahwa email tidak ditemukan (security best practice)
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const hashedToken = hashToken(resetToken);
  
  // Set expiry time (1 jam dari sekarang)
  const expiresAt = new Date(Date.now() + env.RESET_PASSWORD_TOKEN_EXPIRY);

  // Simpan hashed token ke database
  await userRepository.saveResetToken(user.email, hashedToken, expiresAt);

  // Kirim email dengan token asli (bukan yang di-hash)
  await emailService.sendResetPasswordEmail(user.email, resetToken);

  return { message: 'If email exists, reset link has been sent' };
};

const resetPassword = async (token: string, newPassword: string) => {
  // Hash token yang diterima untuk dicocokkan dengan database
  const hashedToken = hashToken(token);

  // Cari user dengan token yang valid dan belum kadaluarsa
  const user = await userRepository.findByResetToken(hashedToken);

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash password baru
  const hashedPassword = await hashPassword(newPassword);

  // Update password user
  await userRepository.updatePassword(user.id, hashedPassword);

  // Clear reset token
  await userRepository.clearResetToken(user.id);

  return { message: 'Password has been reset successfully' };
};

// Export di authService object
const authService = {
  // ... existing methods
  forgotPassword,
  resetPassword,
};
```

### 5.2 Tambahkan method updatePassword di user.repository.ts

```typescript
const updatePassword = async (userId: number, hashedPassword: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

// Tambahkan ke export
const userRepository = {
  // ... existing methods
  updatePassword,
};
```

---

## Step 6: Buat Validation Schema

### 6.1 Tambahkan validation di user.validation.ts

Tambahkan schema berikut ke `src/validations/user.validation.ts`:

```typescript
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
```

---

## Step 7: Update Auth Controller

### 7.1 Tambahkan controller methods di auth.controller.ts

Tambahkan method berikut ke `src/controllers/auth.controller.ts`:

```typescript
const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

// Export di authController object
const authController = {
  // ... existing methods
  forgotPassword,
  resetPassword,
};
```

---

## Step 8: Update Routes

### 8.1 Tambahkan routes di auth.routes.ts

Tambahkan route berikut ke `src/routes/auth.routes.ts`:

```typescript
import { forgotPasswordSchema, resetPasswordSchema } from '../validations/user.validation.ts';

// Tambahkan routes
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);
```

---

## Step 9: Testing

### 9.1 Test Forgot Password Endpoint

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "If email exists, reset link has been sent"
}
```

### 9.2 Cek Email

Periksa inbox email yang Anda gunakan. Anda harus menerima email dengan link reset password.

### 9.3 Test Reset Password Endpoint

Copy token dari email dan gunakan untuk reset password:

```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "NewPassword123"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

### 9.4 Test Login dengan Password Baru

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "NewPassword123"
  }'
```

---

## Step 10: Security Best Practices

### 10.1 Rate Limiting (Opsional tapi Direkomendasikan)

Install express-rate-limit:

```bash
pnpm add express-rate-limit
```

Tambahkan rate limiting untuk forgot password endpoint di `auth.routes.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 3, // Maksimal 3 request per 15 menit
  message: 'Too many password reset attempts, please try again later',
});

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
```

### 10.2 Checklist Security

- ✅ Token di-hash sebelum disimpan di database
- ✅ Token memiliki expiry time (1 jam)
- ✅ Tidak memberitahu user jika email tidak ditemukan
- ✅ Token hanya bisa digunakan sekali (dihapus setelah reset)
- ✅ Password validation yang kuat
- ✅ Rate limiting untuk mencegah abuse

---

## Step 11: Update Documentation

### 11.1 Update README.md

Tambahkan dokumentasi API endpoints baru:

```markdown
### Forgot Password
POST /auth/forgot-password
Request body:
{
  "email": "user@example.com"
}

### Reset Password
POST /auth/reset-password
Request body:
{
  "token": "reset-token-from-email",
  "password": "NewPassword123"
}
```

---

## Troubleshooting

### Email tidak terkirim

1. Pastikan EMAIL_USER dan EMAIL_PASSWORD sudah benar
2. Untuk Gmail, pastikan menggunakan App Password, bukan password biasa
3. Cek apakah "Less secure app access" diaktifkan (untuk Gmail)
4. Cek log error di console

### Token invalid atau expired

1. Pastikan token belum kadaluarsa (cek resetPasswordExpires di database)
2. Pastikan token yang digunakan sama dengan yang dikirim via email
3. Token hanya bisa digunakan sekali

### Migration error

```bash
# Reset database (HATI-HATI: akan menghapus semua data)
npx prisma migrate reset

# Atau buat migration baru
npx prisma migrate dev
```

---

## Summary

Fitur forgot password / reset password sudah berhasil diimplementasikan dengan:

✅ Database schema untuk menyimpan reset token
✅ Email service untuk mengirim link reset password
✅ Token generation dan hashing untuk keamanan
✅ API endpoints untuk forgot password dan reset password
✅ Validation untuk input user
✅ Security best practices (rate limiting, token expiry, dll)
✅ Testing dan documentation

**Next Steps:**
- Implementasi frontend untuk form forgot password dan reset password
- Setup email service di production (gunakan service seperti SendGrid, AWS SES, dll)
- Monitor dan logging untuk tracking reset password attempts
