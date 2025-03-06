import { z } from "@hono/zod-openapi";

export const carSchema = z
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
    groupId: z.number().openapi({
      example: 1,
    }),
    name: z.string().min(1).openapi({
      example: "Car",
    }),
    width: z.number().positive().openapi({
      example: 1.0,
    }),
    length: z.number().positive().openapi({
      example: 1.0,
    }),
    height: z.number().positive().openapi({
      example: 1.0,
    }),
    antenna_x_offset: z.number().openapi({
      example: 1.0,
    }),
    antenna_y_offset: z.number().openapi({
      example: 1.0,
    }),
    antenna_z_offset: z.number().openapi({
      example: 1.0,
    }),
  })
  .openapi("Car");
