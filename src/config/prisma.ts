import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import env from './env.ts';

const pool = new Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);
const prismaClient: PrismaClient = new PrismaClient({ adapter });

export default prismaClient;
