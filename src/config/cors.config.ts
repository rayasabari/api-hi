import type { CorsOptions } from 'cors';
import env from './env.ts';

/**
 * CORS Configuration
 * 
 * Configures Cross-Origin Resource Sharing to allow requests from frontend
 * applications with different origins than the API.
 */

/**
 * Dynamic origin validation
 * Checks if the requesting origin is in the whitelist
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (e.g., from Postman, curl, or same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in the whitelist
    if (env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },

  // Allow credentials (cookies, authorization headers, TLS client certificates)
  credentials: env.corsCredentials,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers in request
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  // Headers accessible by browser
  exposedHeaders: ['Content-Range', 'X-Content-Range'],

  // Cache duration for preflight request (24 hours)
  maxAge: 86400,

  // Allow status code 204 for preflight
  optionsSuccessStatus: 204,
};

export default corsOptions;
