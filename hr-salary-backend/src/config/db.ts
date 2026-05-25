import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Create Prisma adapter factory for SQLite
const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

// Create Prisma client with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
