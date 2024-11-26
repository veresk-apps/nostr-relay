const { parseJson } = require("./utils/json");
const { sendNoticeInvalid } = require("./utils/send");

function start({ wss, onConnection, onError, onClose, onMessage }) {
  wss.on("connection", (ws) => {
    onConnection(ws);
    ws.on("error", (error) => onError({ ws, error }));
    ws.on("close", () => onClose({ ws }));
    ws.on("message", (buffer) => {
      parseJson({
        data: buffer.toString("utf8"),
        onSuccess: (message) => onMessage({ ws, message }),
        onError: () =>
          sendNoticeInvalid({ ws, reason: "message is not valid JSON" }),
      });
    });
  });
}

module.exports = {
  start,
};
