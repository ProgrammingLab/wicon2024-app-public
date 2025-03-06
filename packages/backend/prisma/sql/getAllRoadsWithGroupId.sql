SELECT "id","createdAt","updatedAt","name","groupId","fieldId","coordinates"::text FROM "Road"
WHERE "groupId" = ANY($1)
