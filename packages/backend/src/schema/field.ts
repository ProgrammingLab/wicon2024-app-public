import { z } from "@hono/zod-openapi";

export const fieldSchema = z
  .object({
    id: z.coerce.number().openapi({
      example: 1,
      param: {
        name: "id",
        in: "path",
      },
    }),
    updatedAt: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    name: z.string().min(1).max(255).openapi({ example: "フィールド" }),
    groupId: z.number().openapi({ example: 1 }),
    area: z.number().min(0).openapi({ example: 1.0 }),
    coordinate: z
      .array(
        z.object({
          lat: z.number().min(-90).max(90),
          lon: z.number().min(-180).max(180),
        }),
      )
      .openapi({ example: [{ lat: 33.0, lon: 140.0 }] }),
  })
  .openapi("Field");
