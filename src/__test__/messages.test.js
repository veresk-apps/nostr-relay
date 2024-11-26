const { createMessageHandler } = require("../messages");

describe("messages", () => {
  it("should handle EVENT message type", () => {
    const message = ["EVENT", {"content": "hello, world"}];
    const onEvent = jest.fn();
    createMessageHandler({ onEvent })({ message });
    expect(onEvent).toHaveBeenCalledWith({
      event: { content: "hello, world" },
    });
  });

  it("should handle REQ message type with 1 query", () => {
    const message = ["REQ", "sub1", "query1"];
    const onReq = jest.fn();
    createMessageHandler({ onReq })({ message });
    expect(onReq).toHaveBeenCalledWith({
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

  it("should send NOTICE if message type is invalid", () => {
    const message = ["INVALID"];
    const ws = {
      send: jest.fn(),
    };
    createMessageHandler({})({ ws, message });
    expect(ws.send).toHaveBeenCalledWith(`["NOTICE","invalid: unknown message type"]`);
  });
});
