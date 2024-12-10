const { createMessageHandler } = require("../messages");
const { WSMock, createDBMock } = require("../../utils/mocks");
const { createEventHandler } = require("../events");
const { createReqHandler } = require("../req");
const {
  expectEOSESent,
  expectEventsSent,
  expectEventsSentInOrder,
  expectOKSent,
  insertEvents,
} = require("../../utils/test-utils");

describe("messages", () => {
  it("should handle EVENT message type", () => {
    const message = ["EVENT", { content: "hello, world" }];
    const onEvent = jest.fn(() => Promise.resolve());
    const ws = new WSMock();
    createMessageHandler({ onEvent })({ ws, message });
    expect(onEvent).toHaveBeenCalledWith({
      ws,
      event: { content: "hello, world" },
    });
  });

  it("should handle REQ message type with 1 query", () => {
    const message = ["REQ", "sub1", "query1"];
    const onReq = jest.fn(() => Promise.resolve());
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
    const onReq = jest.fn(() => Promise.resolve());
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

  describe("subscription", () => {
    it("should send new event for active subscription if event matches filters", async () => {
      const subscription = "sub1";
      const reqMsg = ["REQ", subscription, { kinds: [1], authors: ["pub1"] }];
      const baseEvent = { kind: 1, pubkey: "pub1", created_at: 100 };
      const oldEvent = { ...baseEvent, id: "0" };
      const newEvent = { ...baseEvent, id: "1" };
      const eventMsg = ["EVENT", newEvent];
      const db = createDBMock();
      const ws = new WSMock();

      await insertEvents({ db, events: [oldEvent] });

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db })
      });

      await onMessage({ ws, message: reqMsg });
      expectEventsSent({ ws, subscription, events: [oldEvent] });
      expectEOSESent({ ws, subscription });

      await onMessage({ ws, message: eventMsg });
      expectOKSent({ ws, subscription, eventId: "1" });
      expectEventsSent({ ws, subscription, events: [newEvent] });
      expect(ws.send).toHaveBeenCalledTimes(4);
    });

    it("should not send new event for active subscription if event does not match filters", async () => {
      const subscription = "sub1";
      const reqMsg = [
        "REQ",
        subscription,
        { ids: ["0"] },
        { kinds: [0] },
        { authors: "pub0" },
        { since: 110 },
        { until: 90 }
      ];
      const event = { id: "1", kind: 1, author: "pub1", created_at: 100 };
      const eventMsg = ["EVENT", event];
      const db = createDBMock();
      const ws = new WSMock();

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db })
      });

      await onMessage({ ws, message: reqMsg });
      expectEOSESent({ ws, subscription });

      await onMessage({ ws, message: eventMsg });
      expectOKSent({ ws, subscription, eventId: "1" });
      expect(ws.send).toHaveBeenCalledTimes(2);
    });
  });
});
