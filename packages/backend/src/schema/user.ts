import { z } from "@hono/zod-openapi";
import { Country } from "@prisma/client";

export const userSchema = z
  .object({
    id: z.string().openapi({
      description: "User ID",
      param: {
        name: "id",
        in: "path",
      },
      example: "xdumPg9v0Wws6db8D8gtdGU6gePh",
    }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    country: z.nativeEnum(Country),
  })
  .openapi("User");
