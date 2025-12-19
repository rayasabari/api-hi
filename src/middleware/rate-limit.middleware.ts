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
 * Implements cooldown to prevent spam and abuse
 * - 1 minute cooldown between requests (max 1 request per minute)
 * - This acts as a cooldown mechanism
 */
export const resendVerificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute cooldown
  max: 1, // Max 1 request per window (enforces cooldown)
  message: {
    status: 'error',
    message: 'Please wait 1 minute before requesting another verification email',
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
