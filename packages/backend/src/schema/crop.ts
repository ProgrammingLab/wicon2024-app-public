import { z } from "@hono/zod-openapi";

export const cropSchema = z
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
    name: z.string().min(1).max(255).openapi({
      example: "にんじん",
    }),
    groupId: z.number().openapi({
      example: 1,
    }),
    cropGroupId: z.number().openapi({
      example: 1,
    }),
  })
  .openapi("Crop");
