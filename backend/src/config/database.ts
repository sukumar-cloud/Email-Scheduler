import pkg from '@prisma/client';
const { PrismaClient } = pkg;

declare global {
    var __prisma: InstanceType<typeof PrismaClient> | undefined;
}

let prisma: InstanceType<typeof PrismaClient>;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.__prisma) {
        global.__prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
    }
    prisma = global.__prisma;
}

export { prisma };