INSERT INTO "Field" ("createdAt", "updatedAt", "name", "groupId", "area", "coordinate")
VALUES (current_timestamp, current_timestamp, $1, $2, $3, CAST($4 as text)::polygon)
