const { WebSocketServer } = require("ws");
const server = require("./server");
const { createMessageHandler } = require("./messages");
const { createEventHandler } = require("./events");

server.start({
  wss: new WebSocketServer({ port: 8080 }),
  onConnection: () => console.log("connected"),
  onError: ({ error }) => console.error(`[SOCKET ERROR] ${error.message}`),
  onClose: () => console.log("connection closed"),
  onMessage: createMessageHandler({
    onEvent: createEventHandler({}),
  }),
});
