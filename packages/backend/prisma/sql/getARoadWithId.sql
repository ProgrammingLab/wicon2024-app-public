SELECT "id","createdAt","updatedAt","name","groupId","fieldId","coordinates"::text FROM "Road"
WHERE "id" = $1
LIMIT 1
