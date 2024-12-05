const { where, includes, __, always, gte, lte, filter, pipe, slice } = require("ramda");
const { sortEvents } = require("./sort");

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
        return events.find((event) => event.id === id);
      },
      async findMany(query) {
        return pipe(
          filter(
            where({
              id: query.ids ? includes(__, query.ids) : always(true),
              pubkey: query.authors
                ? includes(__, query.authors)
                : always(true),
              kind: query.kinds ? includes(__, query.kinds) : always(true),
              created_at: query.since ? gte(__, query.since) : always(true),
            })
          ),
          filter(
            where({
              created_at: query.until ? lte(__, query.until) : always(true),
            })
          ),
          sortEvents,
          slice(0, query.limit)
        )(events);
      },
    },
  };
}

module.exports = {
  WSMock,
  WSSMock,
  createDBMock,
};
