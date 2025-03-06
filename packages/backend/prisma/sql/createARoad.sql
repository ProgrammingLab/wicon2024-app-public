INSERT INTO "Road" ("createdAt", "updatedAt", "name", "groupId", "fieldId", "coordinates")
VALUES (current_timestamp, current_timestamp, $1, $2, $3, CAST($4 as text)::path)
