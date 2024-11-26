function silenceLogs() {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(jest.fn());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
}

module.exports = { silenceLogs };
