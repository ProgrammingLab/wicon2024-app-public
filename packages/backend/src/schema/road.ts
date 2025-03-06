import { z } from "@hono/zod-openapi";

export const roadSchema = z
  .object({
    id: z.coerce.number().openapi({
      example: 1,
      param: {
        name: "id",
        in: "path",
      },
    }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    name: z.string().min(1).max(255).openapi({ example: "道" }),
    groupId: z.number().openapi({ example: 1 }),
    fieldId: z.number().openapi({ example: 1 }),
    coordinates: z
      .array(
        z.object({
          lat: z.number().min(-90).max(90),
          lon: z.number().min(-180).max(180),
        }),
      )
      .openapi({ example: [{ lat: 33.0, lon: 140.0 }] }),
  })
  .openapi("Road");
