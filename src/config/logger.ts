import pino from 'pino';
import env from './env';

const isDevelopment = env.nodeEnv !== 'production';

// Create logger with conditional configuration
const logger = isDevelopment
  ? pino({
    level: env.logLevel || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
    base: {
      env: env.nodeEnv || 'development',
    },
  })
  : pino({
    level: env.logLevel || 'info',
    base: {
      env: env.nodeEnv || 'production',
    },
  });

export default logger;
