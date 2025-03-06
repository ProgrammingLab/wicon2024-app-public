import { z } from "@hono/zod-openapi";
import { SeasonType } from "@prisma/client";

export const diaryPackSchema = z
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
    name: z.string().openapi({ example: "日記パック" }),
    averageSeasonType: z.nativeEnum(SeasonType).openapi({
      example: "warm",
    }),
    groupId: z.number().openapi({ example: 1 }),
    cropId: z.number().openapi({ example: 1 }),
    fieldId: z.number().openapi({ example: 1 }),
  })
  .openapi("DiaryPack");
