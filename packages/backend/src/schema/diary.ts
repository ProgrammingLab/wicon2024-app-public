import { z } from "@hono/zod-openapi";
import { DiaryType } from "@prisma/client";

import { taskSchema } from "./task";
import { weatherSchema } from "./weather";

export const diarySchema = z
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
    diaryPackId: z.number().openapi({
      example: 1,
    }),
    pesticideRegistrationNumber: z.number().nullable().openapi({
      example: 1234567890,
    }),
    fertilizerRegistrationNumber: z.string().nullable().openapi({
      example: "123456789012",
    }),
    pesticideAmount: z.number().nullable().openapi({
      example: 1.0,
    }),
    fertilizerAmount: z.number().nullable().openapi({
      example: 1.0,
    }),
    workerId: z.string().openapi({
      example: "xdumPg9v0Wws6db8D8gtdGU6gePh",
    }),
    registrerId: z.string().openapi({
      example: "xdumPg9v0Wws6db8D8gtdGU6gePh",
    }),
    weatherId: z
      .union([
        z.string().startsWith("template-"),
        z.string().startsWith("custom-"),
      ])
      .openapi({
        example: "template-1",
      }),
    taskId: z
      .union([
        z.string().startsWith("template-"),
        z.string().startsWith("custom-"),
      ])
      .openapi({
        example: "template-1",
      }),
    datetime: z.string().datetime({ offset: true }).openapi({
      example: "2024-01-01T00:00:00+09:00",
    }),
    type: z.nativeEnum(DiaryType).openapi({
      example: "record",
    }),
    note: z.string().openapi({
      example: "note",
    }),
  })
  .openapi("Diary");

export const diaryResponseSchema = diarySchema.merge(
  z.object({
    weather: weatherSchema.shape.name,
    task: taskSchema.shape.name,
  }),
);
