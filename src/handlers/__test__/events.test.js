const { createEventHandler } = require("../events");
const { WSMock, createDBMock } = require("../../utils/mocks");
const { silenceLogs } = require("../../utils/test-utils");

describe("events", () => {
  silenceLogs();

  it("should send OK false with connection error in case of db issues", async () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    const db = createDBMock();
    const error = "err";
    db.events.insertOne = jest.fn(() => Promise.reject(error));

    await createEventHandler({ db })({ ws, event });
    expect(console.log).toHaveBeenCalledWith(
      "error: could not connect to the database",
      error
    );
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify([
        "OK",
        "event-id",
        false,
        "error: could not connect to the database",
      ])
    );
  });

  it("should send OK true with duplicate message in case of the duplicate", async () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    const db = createDBMock();
    await db.events.insertOne(event);
    const message = "duplicate: already have this event";
    await createEventHandler({ db })({ ws, event });

    expect(console.log).toHaveBeenCalledWith(message);
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify(["OK", "event-id", true, message])
    );
  });

  it("should send OK true if data was saved in the db", async () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    const db = createDBMock();
    await createEventHandler({ db })({ ws, event });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify(["OK", "event-id", true, ""])
    );
  });
});
