import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: "dpg-d7miuscvikkc73803gug-a.oregon-postgres.render.com",
  port: 5432,
  database: "hackverse_db_y47m",
  user: "hackverse_db_y47m_user",
  password: "8HHVrC0SDVh4JwK6g3baa0SYt3OhEx3u",
  ssl: {
    rejectUnauthorized: false,
  },
});
