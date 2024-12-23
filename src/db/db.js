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
    async findMany(query) {
      return sql.file(getPath("find-events.sql"), [
        query.ids ?? null,
        query.authors ?? null,
        query.kinds ?? null,
        query.since ?? null,
        query.until ?? null,
        query.limit ?? null
      ]);
    },
  },
};

module.exports = { db };
