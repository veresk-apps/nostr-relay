import "dotenv/config";
import shift from "postgres-shift";
import postgres from "postgres";
import { fileURLToPath } from "url";

const { NOSTR_DB_PASSWORD } = process.env;

export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "nostr",
  user: "nostr",
  pass: NOSTR_DB_PASSWORD,
  idle_timeout: 1,
});

shift({
  sql,
  path: fileURLToPath(new URL("migrations", import.meta.url)),
  before: ({ migration_id, name }) => {
    console.log("Migrating", migration_id, name);
  },
})
  .then(() => console.log("All good"))
  .catch((err) => {
    console.error("Failed", err);
    process.exit(1);
  });
