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


function createDBMock() {
  const events = [];
  return {
    events: {
      async insertOne(event) {
        events.push(event);
      },
      async findOne(id) {
        events.find((event) => event.id === id);
      },
    },
  };
}

module.exports = {
  WSMock,
  WSSMock,
  createDBMock,
};
