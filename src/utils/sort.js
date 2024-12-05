const { sortWith, descend, prop, ascend } = require("ramda");

function sortEvents(events) {
  return sortWith([descend(prop("created_at")), ascend(prop("id"))], events);
}

module.exports = { sortEvents };
