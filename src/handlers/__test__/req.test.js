const { WSMock, createDBMock } = require("../../utils/mocks");
const { silenceLogs } = require("../../utils/test-utils");
const { createReqHandler } = require("../req");

describe("req", () => {
  silenceLogs();

  it("should send CLOSE if no events", async () => {
    const subscription = "sub1";
    const ws = new WSMock();
    const db = createDBMock();
    const queries = [];
    await createReqHandler({ db })({ ws, subscription, queries });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expectClosedSent({
      ws,
      subscription,
      message: "error: no filters specified",
    });
  });

  it("should send EOSE if no events", async () => {
    const subscription = "sub1";
    const ws = new WSMock();
    const db = createDBMock();
    const queries = [{ ids: [] }];
    await createReqHandler({ db })({ ws, subscription, queries });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expectEOSESent({ ws, subscription });
  });

  it("should send an event for ids filter", async () => {
    const subscription = "sub1";
    const queries = [{ ids: ["1", "2"] }];
    const ws = new WSMock();
    const db = createDBMock();
    const event = { id: "1" };
    await db.events.insertOne(event);
    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(2);
    expectEventsSent({ ws, subscription, events: [event] });
    expectEOSESent({ ws, subscription });
  });

  it("should send an event for authors filter", async () => {
    const subscription = "sub1";
    const queries = [{ authors: ["pub1"] }];
    const ws = new WSMock();
    const db = createDBMock();
    const event = { id: "1", pubkey: "pub1" };
    await db.events.insertOne(event);
    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(2);
    expectEventsSent({ ws, subscription, events: [event] });
    expectEOSESent({ ws, subscription });
  });

  it("should not send an event if authors filter do not match", async () => {
    const subscription = "sub1";
    const queries = [{ authors: ["pubx"] }];
    const ws = new WSMock();
    const db = createDBMock();
    const event = { id: "1", pubkey: "pub1" };
    await db.events.insertOne(event);
    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(1);
    expectEOSESent({ ws, subscription });
  });

  it("should send events", async () => {
    const subscription = "sub1";
    const queries = [{ ids: ["1", "2"] }];
    const ws = new WSMock();
    const db = createDBMock();
    const events = [{ id: "1" }, { id: "2" }];

    for (const event of events) {
      await db.events.insertOne(event);
    }

    await createReqHandler({ db })({ ws, subscription, queries });

    expect(ws.send).toHaveBeenCalledTimes(3);
    expectEventsSent({ ws, subscription, events });
    expectEOSESent({ ws, subscription });
  });
});

function expectEventsSent({ ws, subscription, events }) {
  for (const event of events) {
    expect(ws.send).toHaveBeenCalledWith(
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
