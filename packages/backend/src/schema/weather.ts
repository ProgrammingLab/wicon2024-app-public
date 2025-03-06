import { z } from "@hono/zod-openapi";

export const weatherSchema = z
  .object({
    id: z
      .union([
        z.string().startsWith("template-"),
        z.string().startsWith("custom-"),
      ])
      .openapi({
        example: "template-1",
        param: {
          name: "id",
          in: "path",
        },
      }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    name: z.string().min(1).max(255).openapi({
      example: "晴れ",
    }),
    groupId: z.number().openapi({
      example: 1,
    }),
  })
  .openapi("Weather");

export const weatherResponseSchema = weatherSchema.partial({
  groupId: true,
});
