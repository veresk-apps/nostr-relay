const postgres = require("postgres");

const { NOSTR_DB_PASSWORD } = process.env;

const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "nostr",
  user: "nostr",
  pass: NOSTR_DB_PASSWORD,
  idle_timeout: 1,
});

module.exports = { sql };
