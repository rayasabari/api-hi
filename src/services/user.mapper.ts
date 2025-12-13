import type { User } from '../../generated/prisma/client.ts';
import type { PublicUser } from '../types/user.ts';

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName ?? null,
  email: user.email,
});
