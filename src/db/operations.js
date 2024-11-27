const { sql } = require("./db");

function getPath(fileName) {
  return `${__dirname}/sql/${fileName}`;
}

async function insertEvent({
  id,
  pubkey,
  created_at,
  kind,
  tags,
  content,
  sig,
}) {
  return await sql.file(getPath("insert-event.sql"), [
    id,
    pubkey,
    created_at,
    kind,
    tags,
    content,
    sig,
  ]);
}

module.exports = { insertEvent };
