function sendNoticeInvalid({ ws, reason }) {
  sendNotice({ ws, prefix: "invalid", reason });
}

function sendNotice({ ws, prefix, reason }) {
  sendJson({ ws, data: ["NOTICE", `${prefix}: ${reason}`] });
}

function sendOk({ ws, eventId, success, prefix, reason }) {
  sendJson({ ws, data: ["OK", eventId, success, `${prefix}: ${reason}`] });
}

function sendJson({ ws, data }) {
  ws.send(JSON.stringify(data));
}

module.exports = { sendNoticeInvalid, sendNotice, sendJson, sendOk };
