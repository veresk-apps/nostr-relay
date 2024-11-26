const { sendNoticeInvalid } = require("./utils/send");

const createMessageHandler =
  ({ onEvent, onReq, onClose }) =>
  ({ ws, message }) => {
    const [type, eventOrSub, ...queries] = message;
      switch (type) {
        case "EVENT":
          onEvent({ event: eventOrSub });
          break;
        case "REQ":
          onReq({ subscription: eventOrSub, queries });
          break;
        case "CLOSE":
          onClose({ subscription: eventOrSub });
          break;
        default:
          sendNoticeInvalid({ ws, reason: "unknown message type" });
      }
  };

module.exports = { createMessageHandler };
