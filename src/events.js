const { sendOk } = require("./utils/send");

const createEventHandler =
  () =>
  ({ ws, event }) => {
    sendOk({
      ws,
      eventId: event.id,
      success: false,
      prefix: "error",
      reason: "could not connect to the database",
    });
  };

module.exports = { createEventHandler };
