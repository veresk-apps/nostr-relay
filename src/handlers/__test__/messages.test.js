const { createMessageHandler } = require("../messages");
const { WSMock, createDBMock } = require("../../utils/mocks");
const { createEventHandler } = require("../events");
const { createReqHandler } = require("../req");
const {
  expectEOSESent,
  expectEventsSent,
  expectOKSent,
  insertEvents,
} = require("../../utils/test-utils");

describe("messages", () => {
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
        onEvent: createEventHandler({ db }),
      });

      await onMessage({ ws, message: reqMsg });
      expectEventsSent({ ws, subscription, events: [oldEvent] });
      expectEOSESent({ ws, subscription });

      await onMessage({ ws, message: eventMsg });
      expectOKSent({ ws, subscription, eventId: "1" });
      expectEventsSent({ ws, subscription, events: [newEvent] });
      expect(ws.send).toHaveBeenCalledTimes(4);
    });

    it("should send event only to the socket that created subscription", async () => {
      const subscription = "sub1";
      const reqMsg = ["REQ", subscription, { kinds: [1] }];
      const event = { id: "1", kind: 1, created_at: 100 };
      const eventMsg = ["EVENT", event];
      const db = createDBMock();
      const wsForSub = new WSMock();
      const wsForEvent = new WSMock();

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db }),
      });

      await onMessage({ ws: wsForSub, message: reqMsg });
      await onMessage({ ws: wsForEvent, message: eventMsg });

      expect(wsForEvent.send).not.toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, event])
      );
      expect(wsForSub.send).toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, event])
      );
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
        { until: 90 },
      ];
      const event = { id: "1", kind: 1, author: "pub1", created_at: 100 };
      const eventMsg = ["EVENT", event];
      const db = createDBMock();
      const ws = new WSMock();

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db }),
      });

      await onMessage({ ws, message: reqMsg });
      expectEOSESent({ ws, subscription });

      await onMessage({ ws, message: eventMsg });
      expectOKSent({ ws, subscription, eventId: "1" });

      expect(ws.send).not.toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, event])
      );
    });

    it("should not recieve new events if subscription was recreated, but the new subscription should", async () => {
      const subscription = "sub1"
      const reqMsgSub1 = ["REQ", subscription, { ids: ["1"] }];
      const reqMsgSub2 = ["REQ", subscription, { ids: ["2"] }];
      const event1 = { id: "1", kind: 1, created_at: 100 };
      const event2 = { id: "2", kind: 1, created_at: 101 };
      const eventMsg1 = ["EVENT", event1];
      const eventMsg2 = ["EVENT", event2];
      const db = createDBMock();
      const ws = new WSMock();

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db }),
      });

      await onMessage({ ws, message: reqMsgSub1 });
      await onMessage({ ws, message: reqMsgSub2 });
      await onMessage({ ws, message: eventMsg1 });
      await onMessage({ ws, message: eventMsg2 });

      expect(ws.send).not.toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, event1])
      );
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, event2])
      );
    });

    it("should stop sending events after the subscription is CLOSED", async () => {
      const subscription = "sub1";
      const reqMsg = ["REQ", subscription, { kinds: [1] }];
      const events = [
        { id: "1", kind: 1, created_at: 1 },
        { id: "2", kind: 1, created_at: 2 },
      ];
      const eventMsg1 = ["EVENT", events[0]];
      const eventMsg2 = ["EVENT", events[1]];
      const closeMsg = ["CLOSE", subscription];
      const db = createDBMock();
      const ws = new WSMock();

      const onMessage = createMessageHandler({
        onReq: createReqHandler({ db }),
        onEvent: createEventHandler({ db }),
      });

      await onMessage({ ws, message: reqMsg });
      expectEOSESent({ ws, subscription });

      await onMessage({ ws, message: eventMsg1 });
      expectOKSent({ ws, subscription, eventId: "1" });
      expectEventsSent({ ws, subscription, events: [events[0]] });

      await onMessage({ ws, message: closeMsg });
      await onMessage({ ws, message: eventMsg2 });
      expectOKSent({ ws, subscription, eventId: "2" });

      expect(ws.send).not.toHaveBeenCalledWith(
        JSON.stringify(["EVENT", subscription, events[1]])
      );
      expect(ws.send).toHaveBeenCalledTimes(4);
    });
  });
});
