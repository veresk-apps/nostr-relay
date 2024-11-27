const { createEventHandler } = require("../events");
const { WSMock, DBMock, createDBMock } = require("../utils/mocks");
const { silenceLogs } = require("../utils/test-utils");

describe("events", () => {
  silenceLogs();

  it("should send OK false in case db issues", async () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    const db = createDBMock();
    db.events.insertOne = jest.fn(() => Promise.reject(Error("e")));
    const error = Error("e");

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
  it("should send OK true if data was saved in the db", async () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    const db = createDBMock();
    await createEventHandler({ db })({ ws, event });
    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify([
        "OK",
        "event-id",
        true,
        "",
      ])
    );
  });
});
