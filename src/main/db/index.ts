import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import path from 'path';

let dbPath: string;
if (process.env.NODE_ENV === 'development') {
  dbPath = path.join(process.cwd(), 'genesis.db');
} else {
  dbPath = path.join(app.getPath('userData'), 'genesis.db');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

export default prisma;
