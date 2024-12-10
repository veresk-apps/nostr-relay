const { sendNoticeInvalid, sendEvent } = require("../utils/send");
const { SubscriptionManager } = require("../utils/subscription");

const createMessageHandler = ({ onEvent, onReq }) => {
  const subscriptionManager = new SubscriptionManager();
  return async ({ ws, message }) => {
    const [type, eventOrSub, ...queries] = message;
    switch (type) {
      case "EVENT": {
        const event = eventOrSub;
        await onEvent({ ws, event, subscriptionManager }).catch(console.error);
        break;
      }
      case "REQ": {
        const subscription = eventOrSub;
        await onReq({ ws, subscription, queries, subscriptionManager }).catch(console.error);
        break;
      }
      case "CLOSE": {
        const subscription = eventOrSub;
        subscriptionManager.delete(subscription);
        break;
      }
      default:
        sendNoticeInvalid({ ws, reason: "unknown message type" });
    }
  };
};

module.exports = { createMessageHandler };
