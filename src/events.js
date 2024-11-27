const { sendOk } = require("./utils/send");

const createEventHandler =
  ({ db }) =>
  async ({ ws, event }) => {
    try {
      await db.events.insertOne(event);
      sendOk({
        ws,
        eventId: event.id,
        success: true,
      });
    } catch (error) {
      const message = "error: could not connect to the database";
      console.log(message, error);
      sendOk({
        ws,
        eventId: event.id,
        success: false,
        message,
      });
    }
  };

module.exports = { createEventHandler };
