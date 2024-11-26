function parseJson({ data, onSuccess, onError }) {
  try {
    const parsed = JSON.parse(data);
    onSuccess && onSuccess(parsed);
    return parsed;
  } catch (error) {
    onError && onError(error);
    return null;
  }
}

module.exports = { parseJson };
