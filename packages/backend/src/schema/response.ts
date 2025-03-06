import { z } from "@hono/zod-openapi";

export const responseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("templateResponse");
