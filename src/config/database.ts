import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // PgBouncer compatibility: disable prepared statements
    datasourceUrl: process.env.DATABASE_URL,
});

// Disable prepared statements for PgBouncer
prisma.$connect();

export default prisma;
