const { sendOk, sendEvent } = require("../utils/send");

const createEventHandler =
  ({ db }) =>
  async ({ ws, event, subscriptionManager }) => {
    try {
      await insertEvent({ ws, db, event });
    } catch (error) {
      sendConnectionError({ error, ws, event });
    }
    sendEventToMatchedSubscriptions({ subscriptionManager, event, ws });
  };

async function insertEvent({ ws, db, event }) {
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
}

function sendConnectionError({ error, ws, event }) {
  const message = "error: could not connect to the database";
  console.log(message, error);
  sendOk({
    ws,
    eventId: event.id,
    success: false,
    message,
  });
}

function sendEventToMatchedSubscriptions({ subscriptionManager, event, ws }) {
  for (const subscription of subscriptionManager.match(event)) {
    sendEvent({ ws, subscription: subscription.id, event });
  }
}

module.exports = { createEventHandler };
