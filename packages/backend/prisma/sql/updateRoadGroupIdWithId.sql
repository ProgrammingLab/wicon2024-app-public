UPDATE "Road"
SET "groupId" = $2, "updatedAt" = current_timestamp
WHERE "id" = $1;
