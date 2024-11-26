function parseJson({ data, onSuccess, onError }) {
  let parsed = null;
  try {
    parsed = JSON.parse(data);
  } catch (error) {
    onError && onError(error, data);
  }
  if (parsed && onSuccess) onSuccess(parsed);
  return parsed;
}

module.exports = { parseJson };
