const { sendNoticeInvalid, sendEvent } = require("../utils/send");
const { SubscriptionManager } = require("../utils/subscription");

const createMessageHandler = ({ onEvent, onReq }) => {
  const subscriptionManager = new SubscriptionManager();
  return async ({ ws, message }) => {
    const [type, eventOrSub, ...queries] = message;
    switch (type) {
      case "EVENT": {
        const event = eventOrSub;
        await onEvent({ ws, event }).catch(console.error);
        for (const subscription of subscriptionManager.match(event)) {
          sendEvent({ ws, subscription: subscription.id, event });
        }
        break;
      }
      case "REQ": {
        const subscription = eventOrSub;
        subscriptionManager.add({ id: subscription, queries });
        await onReq({ ws, subscription, queries }).catch(console.error);
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
