UPDATE "Road"
SET "name" = $2, "updatedAt" = current_timestamp
WHERE "id" = $1;
