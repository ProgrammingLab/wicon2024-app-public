UPDATE "Field"
SET "coordinate" = $2::polygon, "updatedAt" = current_timestamp
WHERE "id" = $1;
