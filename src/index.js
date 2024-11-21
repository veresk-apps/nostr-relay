const { WebSocketServer } = require("ws");
const server = require("./server");

server.start({
  wss: new WebSocketServer({ port: 8080 }),
  onConnection: () => console.log("connected"),
  onError: ({ error }) => console.error(`[SOCKET ERROR] ${error.message}`),
  onClose: () => console.log('connection closed'),
  onMessage: ({ ws, message }) => {
    console.log(message.toString());
    ws.send("ack")
  },
});
