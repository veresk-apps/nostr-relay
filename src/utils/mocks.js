class WSSMock {
  eventCallbacks = {
    connection: () => {},
  };
  connections = [];
  on(event, cb) {
    this.eventCallbacks[event] = cb;
  }

  simulateEvent(event, payload) {
    switch (event) {
      case "connection":
        this.connections.push(payload);
        this.eventCallbacks[event](payload);
        break;
    }
  }
}

class WSMock {
  eventCallbacks = {};
  send = jest.fn();
  on(event, cb) {
    this.eventCallbacks[event] = cb;
  }
  simulateEvent(event, payload) {
    this.eventCallbacks[event](payload);
  }
}

module.exports = {
  WSMock,
  WSSMock,
};
