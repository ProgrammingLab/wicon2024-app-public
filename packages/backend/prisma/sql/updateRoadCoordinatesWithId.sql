UPDATE "Road"
SET "coordinates" = $2::path, "updatedAt" = current_timestamp
WHERE "id" = $1;
