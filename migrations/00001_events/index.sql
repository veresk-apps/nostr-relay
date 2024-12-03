CREATE TABLE events (
    id CHAR(64) PRIMARY KEY CHECK (id ~ '^[a-f0-9]{64}$'),
    pubkey CHAR(66) NOT NULL CHECK (pubkey ~ '^[a-f0-9]{66}$'),
    created_at BIGINT NOT NULL,
    kind INTEGER NOT NULL CHECK (kind BETWEEN 0 AND 65535),
    tags JSONB NOT NULL CHECK (jsonb_typeof(tags) = 'array'),
    content TEXT NOT NULL,
    sig CHAR(128) NOT NULL CHECK (sig ~ '^[a-f0-9]{128}$')
);

CREATE INDEX created_at_idx ON events(created_at);
CREATE INDEX pubkey_idx ON events(pubkey);
CREATE INDEX kind_idx ON events(kind);