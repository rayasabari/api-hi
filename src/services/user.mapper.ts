import type { User } from '../generated/prisma/client';
import type { PublicUser } from '../types/user';

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName ?? null,
  email: user.email,
});
