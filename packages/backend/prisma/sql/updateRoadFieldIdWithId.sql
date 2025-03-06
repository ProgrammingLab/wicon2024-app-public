UPDATE "Road"
SET "fieldId" = $2, "updatedAt" = current_timestamp
WHERE "id" = $1;
