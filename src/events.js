const { insertEvent } = require("./db/operations");
const { sendOk } = require("./utils/send");

const createEventHandler =
  () =>
  async ({ ws, event }) => {
    console.log(event);
    try {
      await insertEvent(event);
      sendOk({
        ws,
        eventId: event.id,
        success: true,
        prefix: "",
        reason: "",
      });
    } catch (error) {
      console.log("error: could not connect to the database", error);
      sendOk({
        ws,
        eventId: event.id,
        success: false,
        prefix: "error",
        reason: "could not connect to the database",
      });
    }
  };

module.exports = { createEventHandler };
