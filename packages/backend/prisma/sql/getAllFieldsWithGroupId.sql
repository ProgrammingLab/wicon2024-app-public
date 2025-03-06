SELECT "id","createdAt","updatedAt","name","groupId","area","coordinate"::text FROM "Field"
WHERE "groupId" = ANY($1)
