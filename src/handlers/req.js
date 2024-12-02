const { sendEvent, sendEOSE, sendClosed } = require("../utils/send");

const createReqHandler =
  ({ db }) =>
  async ({ ws, subscription, queries }) => {
    if (!queries.length) {
      sendClosed({ ws, subscription, message: "error: no filters specified" });
      return;
    }
    const [query] = queries;
    const events = await db.events.findMany(query);
    for (const event of events) {
      sendEvent({ ws, subscription, event });
    }
    sendEOSE({ ws, subscription });
  };

module.exports = { createReqHandler };
