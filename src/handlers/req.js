const {
  flatten,
  sortWith,
  descend,
  prop,
  ascend,
  difference,
  keys,
} = require("ramda");
const { sendEvent, sendEOSE, sendClosed } = require("../utils/send");

const ALLOWED_FILTER_NAMES = [
  "ids",
  "authors",
  "kinds",
  "since",
  "until",
  "limit",
];

const createReqHandler =
  ({ db }) =>
  async ({ ws, subscription, queries }) => {
    const queryValidationError = validateQueries(queries);
    if (queryValidationError) {
      return sendClosed({
        ws,
        subscription,
        message: queryValidationError,
      });
    }
    
    await findEvents({ db, queries })
      .then(sortEvents)
      .then((events) => {
        sendEvents({ ws, subscription, events });
      })
      .catch((error) => {
        sendClosedDbError({ ws, subscription, error });
      });
  };

function validateQueries(queries) {
  if (!queries.length) {
    return "error: no filters specified";
  } else if (hasUnknownFilters(queries)) {
    return "error: unknown filter";
  } else {
    return null;
  }
}

function hasUnknownFilters(queries) {
  const allFilters = queries.flatMap(keys);
  return difference(allFilters, ALLOWED_FILTER_NAMES).length > 0;
}

async function findEvents({ db, queries }) {
  const eventGroups = await Promise.all(
    queries.map((query) => db.events.findMany(query))
  );
  return flatten(eventGroups);
}

function sortEvents(events) {
  return sortWith([descend(prop("created_at")), ascend(prop("id"))], events);
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
