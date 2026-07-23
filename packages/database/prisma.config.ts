import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const toolingDatabaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://nexo:invalid@localhost:5432/nexo?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: toolingDatabaseUrl },
});
