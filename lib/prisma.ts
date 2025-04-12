// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// ป้องกันการสร้าง PrismaClient หลายตัวระหว่าง hot-reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
