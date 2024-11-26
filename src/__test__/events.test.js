const { createEventHandler } = require("../events");
const { WSMock } = require("../utils/mocks");

describe("events", () => {
  it("should do smth", () => {
    const event = { id: "event-id", content: "hello" };
    const ws = new WSMock();
    createEventHandler({})({ ws, event });
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
});
