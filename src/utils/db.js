const { flatten } = require("ramda");

async function findEvents({ db, queries }) {
  const eventGroups = await Promise.all(
    queries.map((query) => db.events.findMany(query))
  );
  return flatten(eventGroups);
}

module.exports = { findEvents };
