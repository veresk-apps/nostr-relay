function silenceLogs() {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
}

function expectEOSESent({ ws, subscription }) {
  expect(ws.send).toHaveBeenCalledWith(JSON.stringify(["EOSE", subscription]));
}

function expectEventsSent({ ws, subscription, events }) {
  for (const event of events) {
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify(["EVENT", subscription, event])
    );
  }
}

function expectOKSent({ ws, subscription, eventId }) {
  expect(ws.send).toHaveBeenCalledWith(
    JSON.stringify(["OK", eventId, true, ""])
  );
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

module.exports = {
  silenceLogs,
  expectEOSESent,
  expectEventsSent,
  expectEventsSentInOrder,
  expectClosedSent,
  insertEvents,
  expectOKSent
};
