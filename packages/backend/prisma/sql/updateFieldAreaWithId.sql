UPDATE "Field"
SET "area" = $2, "updatedAt" = current_timestamp
WHERE "id" = $1;
