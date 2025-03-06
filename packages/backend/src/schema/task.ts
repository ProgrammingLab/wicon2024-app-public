import { z } from "@hono/zod-openapi";

export const taskSchema = z
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
      example: "はいしゅ",
    }),
    groupId: z.number().openapi({
      example: 1,
    }),
    cropGroupId: z.number().openapi({
      example: 1,
    }),
  })
  .openapi("Task");

export const taskResponseSchema = taskSchema.partial({
  groupId: true,
  cropGroupId: true,
});
