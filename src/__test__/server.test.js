const { start } = require("../server");

describe("server ws", () => {
  it("should register on connection callback", () => {
    const wss = new WSSMock();
    const onConnection = jest.fn();

    start({ wss, onConnection });
    wss.simulateEvent("connection", new WSMock());

    expect(onConnection).toHaveBeenCalled();
  });
  it("should register on error callback", () => {
    const wss = new WSSMock();
    const ws = new WSMock();
    const onError = jest.fn();

    start({ wss, onConnection: jest.fn(), onError });
    wss.simulateEvent("connection", ws);

    const error = Error("e");
    ws.simulateEvent("error", Error("e"));

    expect(onError).toHaveBeenCalledWith({ ws, error });
  });

  it("should register on message callback", () => {
    const wss = new WSSMock();
    const ws = new WSMock();
    const onMessage = jest.fn();

    start({ wss, onConnection: jest.fn(), onMessage });
    wss.simulateEvent("connection", ws);
    ws.simulateEvent("message", Buffer.from("{}", "utf8"));

    expect(onMessage).toHaveBeenCalledWith({ ws, message: {} });
  });

  it("should parse message json before passing it to onMessage", () => {
    const wss = new WSSMock();
    const ws = new WSMock();
    const onMessage = jest.fn();

    start({ wss, onConnection: jest.fn(), onMessage });
    wss.simulateEvent("connection", ws);
    ws.simulateEvent(
      "message",
      Buffer.from(`["EVENT", {"content": "foo"}]`, "utf8")
    );

    expect(onMessage).toHaveBeenCalledWith({
      ws,
      message: ["EVENT", { content: "foo" }],
    });
  });

  it("should send NOTICE if message parsing is failed", () => {
    const wss = new WSSMock();
    const ws = new WSMock();
    const onMessage = jest.fn();

    start({ wss, onConnection: jest.fn(), onMessage });
    wss.simulateEvent("connection", ws);
    ws.simulateEvent("message", Buffer.from("invalid", "utf8"));

    expect(onMessage).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalledWith(
      `["NOTICE","invalid: message is not valid JSON"]`
    );
  });

  it("should register on close callback", () => {
    const wss = new WSSMock();
    const ws = new WSMock();
    const onClose = jest.fn();

    start({ wss, onConnection: jest.fn(), onClose });
    wss.simulateEvent("connection", ws);
    ws.simulateEvent("close");

    expect(onClose).toHaveBeenCalledWith({ ws });
  });
});

class WSSMock {
  eventCallbacks = {
    connection: () => {},
  };
  connections = [];
  on(event, cb) {
    this.eventCallbacks[event] = cb;
  }

  simulateEvent(event, payload) {
    switch (event) {
      case "connection":
        this.connections.push(payload);
        this.eventCallbacks[event](payload);
        break;
    }
  }
}

class WSMock {
  eventCallbacks = {};
  send = jest.fn();
  on(event, cb) {
    this.eventCallbacks[event] = cb;
  }
  simulateEvent(event, payload) {
    this.eventCallbacks[event](payload);
  }
}
