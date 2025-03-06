SELECT "id","createdAt","updatedAt","name","groupId","area","coordinate"::text FROM "Field"
WHERE "id" = $1
LIMIT 1
