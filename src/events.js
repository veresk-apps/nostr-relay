const { sendOk } = require("./utils/send");

const createEventHandler =
  ({ db }) =>
  async ({ ws, event }) => {
    try {
      const prev = await db.events.findOne(event.id);
      if (!prev) {
        await db.events.insertOne(event);
        sendOk({
          ws,
          eventId: event.id,
          success: true,
        });
      } else {
        const message = "duplicate: already have this event";
        console.log(message);
        sendOk({
          ws,
          eventId: event.id,
          success: true,
          message,
        });
      }
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
