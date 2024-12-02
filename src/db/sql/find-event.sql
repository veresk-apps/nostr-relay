SELECT id,
  pubkey,
  created_at,
  kind,
  tags,
  content,
  sig
FROM events
WHERE id = $1;