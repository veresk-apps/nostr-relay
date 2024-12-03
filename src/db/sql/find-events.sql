SELECT id,
  pubkey,
  created_at,
  kind,
  tags,
  content,
  sig
FROM events
WHERE 
  ($1::text[] IS NULL OR id = ANY($1))
  AND
  ($2::text[] IS NULL OR pubkey = ANY($2))
  AND
  ($3::integer[] IS NULL OR kind = ANY($3));
