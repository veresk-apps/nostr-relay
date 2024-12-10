const { difference, keys, uniqBy, prop, pipe, when } = require("ramda");
const { sendEOSE, sendClosed, sendEvents } = require("../utils/send");
const { sortEvents } = require("../utils/sort");
const { findEvents } = require("../utils/db");

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
      .then(
        when(() => queries.length > 1, pipe(sortEvents, uniqBy(prop("id"))))
      )
      .then((events) => {
        sendEvents({ ws, subscription, events });
        sendEOSE({ ws, subscription });
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

function sendClosedDbError({ ws, subscription, error }) {
  const message = "error: could not connect to the database";
  console.log(message, error);
  return sendClosed({ ws, subscription, message });
}

module.exports = { createReqHandler };
