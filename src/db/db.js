const { sql } = require("./connector");

function getPath(fileName) {
  return `${__dirname}/sql/${fileName}`;
}

const db = {
  events: {
    async insertOne({ id, pubkey, created_at, kind, tags, content, sig }) {
      return sql.file(getPath("insert-event.sql"), [
        id,
        pubkey,
        created_at,
        kind,
        tags,
        content,
        sig,
      ]);
    },
    async findOne(eventId) {
      return sql
        .file(getPath("find-event.sql"), [eventId])
        .then(([event]) => event);
    },
  },
};

module.exports = { db };
