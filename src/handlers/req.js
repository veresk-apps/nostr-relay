const { flatten } = require("ramda");
const { sendEvent, sendEOSE, sendClosed } = require("../utils/send");

const createReqHandler =
  ({ db }) =>
  async ({ ws, subscription, queries }) => {
    if (!queries.length) {
      return sendClosed({
        ws,
        subscription,
        message: "error: no filters specified",
      });
    }

    await findEvents({ db, queries })
      .then((events) => {
        sendEvents({ ws, subscription, events });
      })
      .catch((error) => {
        sendClosedDbError({ ws, subscription, error });
      });
  };

async function findEvents({ db, queries }) {
  const eventGroups = await Promise.all(
    queries.map((query) => db.events.findMany(query))
  );
  return flatten(eventGroups);
}

async function sendEvents({ ws, subscription, events }) {
  for (const event of events) {
    sendEvent({ ws, subscription, event });
  }
  sendEOSE({ ws, subscription });
}

function sendClosedDbError({ ws, subscription, error }) {
  const message = "error: could not connect to the database";
  console.log(message, error);
  return sendClosed({ ws, subscription, message });
}

module.exports = { createReqHandler };
