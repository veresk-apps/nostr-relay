const { createMessageHandler } = require("../messages");
const { WSMock } = require("../utils/mocks");

describe("messages", () => {
  it("should handle EVENT message type", () => {
    const message = ["EVENT", { content: "hello, world" }];
    const onEvent = jest.fn();
    const ws = new WSMock();
    createMessageHandler({ onEvent })({ ws, message });
    expect(onEvent).toHaveBeenCalledWith({
      ws,
      event: { content: "hello, world" },
    });
  });

  it("should handle REQ message type with 1 query", () => {
    const message = ["REQ", "sub1", "query1"];
    const onReq = jest.fn();
    const ws = new WSMock();
    createMessageHandler({ onReq })({ ws, message });
    expect(onReq).toHaveBeenCalledWith({
      ws,
      subscription: "sub1",
      queries: ["query1"],
    });
  });

  it("should handle REQ message type with 3 queries", () => {
    const message = ["REQ", "sub1", "query1", "query2", "query3"];
    const onReq = jest.fn();
    createMessageHandler({ onReq })({ message });
    expect(onReq).toHaveBeenCalledWith({
      subscription: "sub1",
      queries: ["query1", "query2", "query3"],
    });
  });

  it("should handle CLOSE message type", () => {
    const message = ["CLOSE", "sub1"];
    const onClose = jest.fn();
    const ws = new WSMock();
    createMessageHandler({ onClose })({ ws, message });
    expect(onClose).toHaveBeenCalledWith({
      ws,
      subscription: "sub1",
    });
  });

  it("should send NOTICE if message type is invalid", () => {
    const message = ["INVALID"];
    const ws = new WSMock();
    createMessageHandler({})({ ws, message });
    expect(ws.send).toHaveBeenCalledWith(
      `["NOTICE","invalid: unknown message type"]`
    );
  });
});
