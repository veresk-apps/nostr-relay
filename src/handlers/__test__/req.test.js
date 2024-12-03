const { WSMock, createDBMock } = require("../../utils/mocks");
const { silenceLogs } = require("../../utils/test-utils");
const { createReqHandler } = require("../req");

describe("req", () => {
  silenceLogs();

  it("should send CLOSE if no events", async () => {
    const { subscription, ws, db, queries } = given();

    await createReqHandler({ db })({ ws, subscription, queries });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expectClosedSent({
      ws,
      subscription,
      message: "error: no filters specified",
    });
  });

  it("should send EOSE if no events", async () => {
    const { subscription, ws, db, queries } = given({ queries: [{ ids: [] }] });

    await createReqHandler({ db })({ ws, subscription, queries });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expectEOSESent({ ws, subscription });
  });

  it("should send an event for ids filter", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ ids: ["1", "2"] }],
      events: [{ id: "1" }],
    });

    await insertEvents({ db, events });

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(2);
    expectEventsSent({ ws, subscription, events });
    expectEOSESent({ ws, subscription });
  });

  it("should send an event for authors filter", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ authors: ["pub1"] }],
      events: [{ id: "1", pubkey: "pub1" }],
    });

    await insertEvents({ db, events });
    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(2);
    expectEventsSent({ ws, subscription, events });
    expectEOSESent({ ws, subscription });
  });

  it("should not send an event if authors filter do not match", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ authors: ["pubx"] }],
      events: [{ id: "1", pubkey: "pub1" }],
    });

    await insertEvents({ db, events });

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(1);
    expectEOSESent({ ws, subscription });
  });

  it("should send events for ids filter", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ ids: ["1", "2"] }],
      events: [{ id: "1" }, { id: "2" }],
    });

    await insertEvents({ db, events });

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(3);
    expectEventsSent({ ws, subscription, events });
    expectEOSESent({ ws, subscription });
  });

  it("should handle many filters", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ ids: ["1"] }, { authors: ["pub2"] }],
      events: [
        { id: "1", pubkey: "pub1" },
        { id: "2", pubkey: "pub2" },
      ],
    });

    await insertEvents({ db, events });

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(3);
    expectEventsSent({ ws, subscription, events });
    expectEOSESent({ ws, subscription });
  });

  it("should send CLOSED event in case of db failure", async () => {
    const { subscription, ws, db, queries, events } = given({
      queries: [{ ids: ["1"] }],
      events: [{ id: "1" }],
    });
    const error = new Error("db failed");
    db.events.findMany = jest.fn(() => Promise.reject(error));

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(1);
    expectClosedSent({
      ws,
      subscription,
      message: "error: could not connect to the database",
    });
  });

  describe("sorting", () => {
    it("should order events by timestamp", async () => {
      const { subscription, ws, db, queries, events } = given({
        queries: [{ ids: ["1", "2", "3"] }],
        events: [
          { id: "2", created_at: 1733220002 },
          { id: "3", created_at: 1733220003 },
          { id: "1", created_at: 1733220001 },
        ],
      });

      await insertEvents({ db, events });
      await createReqHandler({ db })({ ws, subscription, queries });

      const eventsSorted = [
        { id: "3", created_at: 1733220003 },
        { id: "2", created_at: 1733220002 },
        { id: "1", created_at: 1733220001 },
      ];

      expect(ws.send).toHaveBeenCalledTimes(4);
      expectEventsSentInOrder({ ws, subscription, events: eventsSorted });
      expectEOSESent({ ws, subscription });
    });

    it("should order events by id if timestamp is the same", async () => {
      const { subscription, ws, db, queries, events } = given({
        queries: [{ ids: ["1", "2", "3"] }],
        events: [
          { id: "2", created_at: 1733220000 },
          { id: "3", created_at: 1733220000 },
          { id: "1", created_at: 1733220000 },
        ],
      });

      await insertEvents({ db, events });
      await createReqHandler({ db })({ ws, subscription, queries });

      const eventsSorted = [
        { id: "1", created_at: 1733220000 },
        { id: "2", created_at: 1733220000 },
        { id: "3", created_at: 1733220000 },
      ];

      expect(ws.send).toHaveBeenCalledTimes(4);
      expectEventsSentInOrder({ ws, subscription, events: eventsSorted });
      expectEOSESent({ ws, subscription });
    });
  });
});

function expectEventsSent({ ws, subscription, events }) {
  for (const event of events) {
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify(["EVENT", subscription, event])
    );
  }
}

function expectEventsSentInOrder({ ws, subscription, events }) {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    expect(ws.send).toHaveBeenNthCalledWith(
      i + 1,
      JSON.stringify(["EVENT", subscription, event])
    );
  }
}

function expectEOSESent({ ws, subscription }) {
  expect(ws.send).toHaveBeenCalledWith(JSON.stringify(["EOSE", subscription]));
}

function expectClosedSent({ ws, subscription, message }) {
  expect(ws.send).toHaveBeenCalledWith(
    JSON.stringify(["CLOSED", subscription, message])
  );
}

async function insertEvents({ db, events }) {
  for (const event of events) {
    await db.events.insertOne(event);
  }
}

function given({
  subscription = "sub1",
  queries = [],
  events = [],
  ws = new WSMock(),
  db = createDBMock(),
} = {}) {
  return {
    subscription,
    ws,
    db,
    queries,
    events,
  };
}
