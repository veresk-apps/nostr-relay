INSERT INTO events (
    id,
    pubkey,
    created_at,
    kind,
    tags,
    content,
    sig
  )
VALUES ($1, $2, $3, $4, $5, $6, $7);