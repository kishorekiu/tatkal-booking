import { Pool } from "pg";

// Host app on the laptop → published port 5433 (see docker-compose.yml)
export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://tatkal:tatkal_dev@localhost:5433/tatkal",
  max: 50,
});
