import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // PgBouncer compatibility: disable prepared statements
    datasourceUrl: process.env.DATABASE_URL,
});

// Disable prepared statements for PgBouncer
prisma.$connect().then(() => {
    if (process.env.DATABASE_URL?.includes('pgbouncer=true')) {
        console.log('PgBouncer mode detected - prepared statements disabled');
    }
});

export default prisma;
