function start({ wss, onConnection, onError, onClose, onMessage }) {
  wss.on("connection", (ws) => {
    onConnection(ws);
    ws.on("error", (error) => onError({ ws, error }));
    ws.on('close', () => onClose(ws))
    ws.on("message", (buffer) =>
      onMessage({ ws, message: buffer.toString("utf8") })
    );
  });
}

module.exports = {
  start,
};
