const { sql } = require("./connector");

function getPath(fileName) {
  return `${__dirname}/sql/${fileName}`;
}

const db = {
  events: {
    async insertOne({
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
  }
}


module.exports = { db };
