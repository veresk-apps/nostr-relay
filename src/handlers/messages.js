
const { sendNoticeInvalid, sendEvent } = require("../utils/send");

const createMessageHandler = ({ onEvent, onReq, onClose }) => {
  const subscriptions = [];
  return async ({ ws, message }) => {
    const [type, eventOrSub, ...queries] = message;
    switch (type) {
      case "EVENT": {
        const event = eventOrSub;
        await onEvent({ ws, event }).catch(console.error);
        for (const { id, queries } of subscriptions) {
          if (matchAny({ queries, event })) {
            sendEvent({ ws, subscription: id, event });
          }
        }
        break;
      }
      case "REQ": {
        const subscription = eventOrSub;
        subscriptions.push({ id: subscription, queries });
        await onReq({ ws, subscription, queries }).catch(console.error);
        break;
      }
      case "CLOSE": {
        const subscription = eventOrSub;
        await onClose({ ws, subscription });
        break;
      }
      default:
        sendNoticeInvalid({ ws, reason: "unknown message type" });
    }
  };
};

function matchAny({ queries, event }) {
  return queries.some((query) => match({ query, event }));
}

function match({ query, event }) {
  const {
    ids = [event.id],
    kinds = [event.kind],
    authors = [event.pubkey],
    since = event.created_at,
    until = event.created_at,
  } = query;
  return (
    ids.includes(event.id) &&
    kinds.includes(event.kind) &&
    authors.includes(event.pubkey) &&
    since <= event.created_at &&
    until >= event.created_at
  );
}

module.exports = { createMessageHandler };
