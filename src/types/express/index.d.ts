import type { PublicUser } from '../user';

declare global {
  namespace Express {
    interface Request {
      userData?: PublicUser;
    }
  }
}

export {};
