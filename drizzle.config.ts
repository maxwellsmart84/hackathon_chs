import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Note: We're using PlanetScale which doesn't require traditional migrations
// This config is primarily for schema introspection and type generation
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: `mysql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?ssl={"rejectUnauthorized":true}`,
  },
  strict: true,
});
