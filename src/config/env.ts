import 'dotenv/config';

const ensure = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }

  return value;
};

const env = {
  port: Number(process.env.PORT) || 5050,
  jwtSecret: ensure(process.env.JWT_SECRET, 'JWT_SECRET'),
  jwtExpiration: process.env.JWT_EXPIRATION ?? '1h',
  saltRounds: Number(process.env.SALT_ROUNDS) || 10,
};

export default env;
