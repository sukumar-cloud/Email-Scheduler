import pkg from '@prisma/client';

declare global {
    var __prisma: InstanceType<typeof pkg.PrismaClient> | undefined;
}

let prisma: InstanceType<typeof pkg.PrismaClient>;

if (process.env.NODE_ENV === 'production') {
    prisma = new pkg.PrismaClient();
} else {
    if (!global.__prisma) {
        global.__prisma = new pkg.PrismaClient({
            log: ['error', 'warn'],
        });
    }
    prisma = global.__prisma;
}

export { prisma };