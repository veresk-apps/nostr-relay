const { flatten } = require("ramda");
const { sendEvent, sendEOSE, sendClosed } = require("../utils/send");

const createReqHandler =
  ({ db }) =>
  async ({ ws, subscription, queries }) => {
    if (!queries.length) {
      sendClosed({ ws, subscription, message: "error: no filters specified" });
      return;
    }

    const events = await findEventsForAllQueries({ db, queries });
    for (const event of events) {
      sendEvent({ ws, subscription, event });
    }
    sendEOSE({ ws, subscription });
  };

async function findEventsForAllQueries({ db, queries }) {
  const eventGroups = await Promise.all(
    queries.map((query) => db.events.findMany(query))
  );
  return flatten(eventGroups);
}

module.exports = { createReqHandler };
