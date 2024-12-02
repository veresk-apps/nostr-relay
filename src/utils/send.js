function sendNoticeInvalid({ ws, reason }) {
  sendNotice({ ws, prefix: "invalid", reason });
}

function sendNotice({ ws, prefix, reason }) {
  sendJson({ ws, data: ["NOTICE", `${prefix}: ${reason}`] });
}

function sendOk({ ws, eventId, success, message = "" }) {
  sendJson({ ws, data: ["OK", eventId, success, message] });
}

function sendEvent({ ws, subscription, event }) {
  sendJson({ ws, data: ["EVENT", subscription, event] });
}

function sendEOSE({ ws, subscription }) {
  sendJson({ ws, data: ["EOSE", subscription] });
}

function sendClosed({ ws, subscription, message }) {
  sendJson({ ws, data: ["CLOSED", subscription, message] });
}

function sendJson({ ws, data }) {
  ws.send(JSON.stringify(data));
}

module.exports = {
  sendNoticeInvalid,
  sendNotice,
  sendJson,
  sendOk,
  sendEvent,
  sendEOSE,
  sendClosed,
};
