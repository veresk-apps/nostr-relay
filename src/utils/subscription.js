class SubscriptionManager {
  subscriptions = [];
  add(subscription) {
    this.subscriptions.push(subscription);
  }
  delete(subscriptionId) {
    this.subscriptions = this.subscriptions.filter(
      ({ id }) => id != subscriptionId
    );
  }
  match(event) {
    return this.subscriptions.filter(({ queries }) =>
      matchAny({ queries, event })
    );
  }
}

function matchAny({ queries, event }) {
  return queries.some((query) => match({ query, event }));
}

function match({ query, event }) {
  const {
    ids = [event.id],
    kinds = [event.kind],
    authors = [event.pubkey],
    since = event.created_at,
    until = event.created_at,
  } = query;
  return (
    ids.includes(event.id) &&
    kinds.includes(event.kind) &&
    authors.includes(event.pubkey) &&
    since <= event.created_at &&
    until >= event.created_at
  );
}

module.exports = { SubscriptionManager };
