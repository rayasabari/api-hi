import 'dotenv/config';

const ensure = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }

  return value;
};

const env = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5050,
  logLevel: process.env.LOG_LEVEL || 'info',

  // JWT Configuration
  jwtSecret: ensure(process.env.JWT_SECRET, 'JWT_SECRET'),
  jwtExpiration: process.env.JWT_EXPIRATION ?? '1h',
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,

  // Email Configuration
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@app.com',

  // Reset Password Configuration
  resetPasswordTokenExpiry: Number(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 3600000, // 1 hour in milliseconds

  // Email Verification Configuration
  emailVerificationTokenExpiry: Number(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY) || 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',

  // CORS Configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [],
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
};

export default env;
