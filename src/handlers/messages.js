const { sendNoticeInvalid } = require("../utils/send");

const createMessageHandler =
  ({ onEvent, onReq, onClose }) =>
  ({ ws, message }) => {
    const [type, eventOrSub, ...queries] = message;
      switch (type) {
        case "EVENT":
          onEvent({ ws, event: eventOrSub }).catch(console.error);
          break;
        case "REQ":
          onReq({ ws, subscription: eventOrSub, queries });
          break;
        case "CLOSE":
          onClose({ ws, subscription: eventOrSub });
          break;
        default:
          sendNoticeInvalid({ ws, reason: "unknown message type" });
      }
  };

module.exports = { createMessageHandler };
