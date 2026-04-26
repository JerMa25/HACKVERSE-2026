import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "hackverse_db",
  user: "admin",
  password: "password",
  ssl: {
    rejectUnauthorized: false,
  },
});