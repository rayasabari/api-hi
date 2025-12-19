import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for forgot password endpoint
 * Limits requests to prevent brute force attacks
 * - Max 3 requests per 15 minutes per IP
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 requests per window
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for resend verification endpoint
 * Prevents spam while allowing legitimate retries
 * - 3 attempts per 10 minutes
 * - Window-based approach for better spam protection
 */
export const resendVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute window
  max: 3, // Max 3 attempts per window
  message: {
    status: 'error',
    message: 'Too many verification emails requested. Please try again in 10 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * General API rate limiter (optional - can be used for other endpoints)
 * - Max 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
