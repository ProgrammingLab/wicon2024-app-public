import { z } from "@hono/zod-openapi";
import { Role } from "@prisma/client";

export const groupSchema = z
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
    name: z.string().min(1, "Group name is required").openapi({
      example: "Test Group",
    }),
  })
  .openapi("Group");

export const groupResponseSchema = z
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
    name: z.string().min(1, "Group name is required").openapi({
      example: "Test Group",
    }),
    users: z.array(
      z.object({
        id: z.string(),
        role: z.nativeEnum(Role),
        name: z.string(),
      }),
    ),
  })
  .openapi("GroupResponse");
