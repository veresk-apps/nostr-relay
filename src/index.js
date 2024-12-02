const { WebSocketServer } = require("ws");
const server = require("./server");
const { createMessageHandler } = require("./handlers/messages");
const { createEventHandler } = require("./handlers/events");
const { db } = require('./db/db');
const { createReqHandler } = require("./handlers/req");

server.start({
  wss: new WebSocketServer({ port: 8080 }),
  onConnection: () => console.log("connected"),
  onError: ({ error }) => console.error(`[SOCKET ERROR] ${error.message}`),
  onClose: () => console.log("connection closed"),
  onMessage: createMessageHandler({
    onEvent: createEventHandler({ db }),
    onReq: createReqHandler({ db })
  }),
});
