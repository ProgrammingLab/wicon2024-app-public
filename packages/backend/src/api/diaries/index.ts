import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { diaryResponseSchema, diarySchema } from "@/schema/diary";
import { responseSchema } from "@/schema/response";
import { taskSchema } from "@/schema/task";
import { weatherSchema } from "@/schema/weather";

import cropGroups from "./cropGroups";
import crops from "./crops";
import tasks from "./tasks";
import weathers from "./weathers";

const prisma = new PrismaClient();

const routes = {
  getDiaries: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: diarySchema
              .extend({
                weather: weatherSchema.shape.name,
                task: taskSchema.shape.name,
              })
              .array(),
          },
        },
        description: "OK",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed",
      },
    },
  }),
  registerDiary: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: diarySchema.omit({
              id: true,
              createdAt: true,
              updatedAt: true,
            }),
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: diaryResponseSchema,
          },
        },
        description: "Created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
      403: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Forbidden",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed",
      },
    },
  }),
  getDiary: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diarySchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: diaryResponseSchema,
          },
        },
        description: "OK",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed",
      },
    },
  }),
  patchDiary: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diarySchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: diarySchema
              .omit({ id: true, createdAt: true, updatedAt: true })
              .partial()
              .refine((values) => Object.keys(values).length > 0),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: diaryResponseSchema,
          },
        },
        description: "OK",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
      403: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Forbidden",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed",
      },
    },
  }),
  deleteDiary: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diarySchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Diary deleted",
      },
      403: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Forbidden",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed",
      },
    },
  }),
};

const diaries = new OpenAPIHono<{ Variables: Variables }>()
  .route("/crops", crops)
  .route("/tasks", tasks)
  .route("/weathers", weathers)
  .route("/cropGroups", cropGroups)
  .openapi(routes.getDiaries, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    try {
      const diaries = await prisma.diary.findMany({
        where: { groupId: { in: groupIds } },
      });
      const patchedDiaries = [];
      for (const d of diaries) {
        const diariesTemplateWeathers =
          await prisma.diaryTemplateWeather.findFirst({
            where: { diaryId: d.id },
          });
        const templateWeather = await prisma.templateWeather.findFirst({
          where: { id: diariesTemplateWeathers?.templateWeatherId },
        });
        const diariesCustomWeathers = await prisma.diaryCustomWeather.findFirst(
          {
            where: { diaryId: d.id },
          },
        );
        const customWeather = await prisma.customWeather.findFirst({
          where: { id: diariesCustomWeathers?.customWeatherId },
        });
        if (!templateWeather && !customWeather) {
          return c.json({ message: "Weather not found" }, 500);
        }

        const diariesTemplateTasks = await prisma.diaryTemplateTask.findFirst({
          where: { diaryId: d.id },
        });
        const templateTask = await prisma.templateTask.findFirst({
          where: { id: diariesTemplateTasks?.templateTaskId },
        });
        const diariesCustomTasks = await prisma.diaryCustomTask.findFirst({
          where: { diaryId: d.id },
        });
        const customTask = await prisma.customTask.findFirst({
          where: { id: diariesCustomTasks?.customTaskId },
        });
        if (!templateTask && !customTask) {
          return c.json({ message: "Task not found" }, 500);
        }

        patchedDiaries.push({
          ...d,
          weatherId:
            "template-" + diariesTemplateWeathers?.templateWeatherId ||
            "custom-" + diariesCustomWeathers?.customWeatherId ||
            "あり得ない",
          weather: templateWeather?.name || customWeather?.name || "あり得ない",
          taskId:
            "template-" + diariesTemplateTasks?.templateTaskId ||
            "custom-" + diariesCustomTasks?.customTaskId ||
            "あり得ない",
          task: templateTask?.name || customTask?.name || "あり得ない",
        });
      }
      console.log("patchedDiaries:", patchedDiaries);
      return c.json(patchedDiaries, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch diaries" }, 500);
    }
  })
  .openapi(routes.registerDiary, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      if (validated.weatherId.startsWith("template-")) {
        const weather = await prisma.templateWeather.findUnique({
          where: { id: Number(validated.weatherId.replace("template-", "")) },
        });
        if (!weather) {
          return c.json({ message: "Weather not found" }, 400);
        }
      } else if (validated.weatherId.startsWith("custom-")) {
        const weather = await prisma.customWeather.findUnique({
          where: { id: Number(validated.weatherId.replace("custom-", "")) },
        });
        if (!weather) {
          return c.json({ message: "Weather not found" }, 400);
        }
      }

      if (validated.taskId.startsWith("template-")) {
        const task = await prisma.templateTask.findUnique({
          where: { id: Number(validated.taskId.replace("template-", "")) },
        });
        if (!task) {
          return c.json({ message: "DiaryTaskType not found" }, 400);
        }
      } else if (validated.taskId.startsWith("custom-")) {
        const task = await prisma.customTask.findUnique({
          where: { id: Number(validated.taskId.replace("custom-", "")) },
        });
        if (!task) {
          return c.json({ message: "DiaryTaskType not found" }, 400);
        }
      }

      const diary = await prisma.diary.create({
        data: {
          groupId: validated.groupId,
          diaryPackId: validated.diaryPackId,
          pesticideRegistrationNumber: validated.pesticideRegistrationNumber,
          fertilizerRegistrationNumber: validated.fertilizerRegistrationNumber,
          pesticideAmount: validated.pesticideAmount,
          fertilizerAmount: validated.fertilizerAmount,
          workerId: validated.workerId,
          registrerId: validated.registrerId,
          datetime: validated.datetime,
          type: validated.type,
          note: validated.note,
        },
      });

      let diariesTemplateWeathers;
      let diariesCustomWeathers;
      if (validated.weatherId.startsWith("template-")) {
        diariesTemplateWeathers = await prisma.diaryTemplateWeather.create({
          data: {
            diaryId: diary.id,
            templateWeatherId: Number(
              validated.weatherId.replace("template-", ""),
            ),
          },
        });
      } else if (validated.weatherId.startsWith("custom-")) {
        diariesCustomWeathers = await prisma.diaryCustomWeather.create({
          data: {
            diaryId: diary.id,
            customWeatherId: Number(validated.weatherId.replace("custom-", "")),
          },
        });
      }

      let diariesTemplateTasks;
      let diariesCustomTasks;
      if (validated.taskId.startsWith("template-")) {
        diariesTemplateTasks = await prisma.diaryTemplateTask.create({
          data: {
            diaryId: diary.id,
            templateTaskId: Number(validated.taskId.replace("template-", "")),
          },
        });
      } else if (validated.taskId.startsWith("custom-")) {
        diariesCustomTasks = await prisma.diaryCustomTask.create({
          data: {
            diaryId: diary.id,
            customTaskId: Number(validated.taskId.replace("custom-", "")),
          },
        });
      }

      const templateWeather = await prisma.templateWeather.findFirst({
        where: { id: diariesTemplateWeathers?.templateWeatherId },
      });
      const customWeather = await prisma.customWeather.findFirst({
        where: { id: diariesCustomWeathers?.customWeatherId },
      });
      const templateTask = await prisma.templateTask.findFirst({
        where: { id: diariesTemplateTasks?.templateTaskId },
      });
      const customTask = await prisma.customTask.findFirst({
        where: { id: diariesCustomTasks?.customTaskId },
      });

      return c.json(
        {
          ...diary,
          weatherId: validated.weatherId,
          weather: templateWeather?.name || customWeather?.name || "あり得ない",
          taskId: validated.taskId,
          task: templateTask?.name || customTask?.name || "あり得ない",
        },
        201,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create a diary" }, 500);
    }
  })
  .openapi(routes.getDiary, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const diary = await prisma.diary.findFirst({
        where: { id: id, groupId: { in: groupIds } },
      });
      if (!diary) {
        return c.json({ message: "Not found" }, 404);
      }

      const diariesTemplateWeathers =
        await prisma.diaryTemplateWeather.findFirst({
          where: { diaryId: id },
        });
      const templateWeather = await prisma.templateWeather.findFirst({
        where: { id: diariesTemplateWeathers?.templateWeatherId },
      });
      const diariesCustomWeathers = await prisma.diaryCustomWeather.findFirst({
        where: { diaryId: id },
      });
      const customWeather = await prisma.customWeather.findFirst({
        where: { id: diariesCustomWeathers?.customWeatherId },
      });

      const diariesTemplateTasks = await prisma.diaryTemplateTask.findFirst({
        where: { diaryId: id },
      });
      const templateTask = await prisma.templateTask.findFirst({
        where: { id: diariesTemplateTasks?.templateTaskId },
      });
      const diariesCustomTasks = await prisma.diaryCustomTask.findFirst({
        where: { diaryId: id },
      });
      const customTask = await prisma.customTask.findFirst({
        where: { id: diariesCustomTasks?.customTaskId },
      });

      return c.json(
        {
          ...diary,
          weatherId:
            "template-" + diariesTemplateWeathers?.templateWeatherId ||
            "custom-" + diariesCustomWeathers?.customWeatherId ||
            "あり得ない",
          weather: templateWeather?.name || customWeather?.name || "あり得ない",
          taskId:
            "template-" + diariesTemplateTasks?.templateTaskId ||
            "custom-" + diariesCustomTasks?.customTaskId ||
            "あり得ない",
          task: templateTask?.name || customTask?.name || "あり得ない",
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch a diary" }, 500);
    }
  })
  .openapi(routes.patchDiary, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));
    const validated = c.req.valid("json");

    if (validated.groupId) {
      if (!groupIds.includes(validated.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
    }

    try {
      let diary = await prisma.diary.findFirst({
        where: { id: id },
      });
      if (!diary) {
        return c.json({ message: "Not found" }, 404);
      }
      if (!groupIds.includes(diary.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      if (validated.taskId) {
        if (validated.taskId.startsWith("template-")) {
          const task = await prisma.templateTask.findUnique({
            where: { id: Number(validated.taskId.replace("template-", "")) },
          });
          if (!task) {
            return c.json({ message: "Task not found" }, 400);
          }
        } else if (validated.taskId.startsWith("custom-")) {
          const task = await prisma.customTask.findUnique({
            where: { id: Number(validated.taskId.replace("custom-", "")) },
          });
          if (!task) {
            return c.json({ message: "Task not found" }, 400);
          }
        }
      } else if (validated.weatherId) {
        if (validated.weatherId.startsWith("template-")) {
          const weather = await prisma.templateWeather.findUnique({
            where: {
              id: Number(validated.weatherId.replace("template-", "")),
            },
          });
          if (!weather) {
            return c.json({ message: "Weather not found" }, 400);
          }
        } else if (validated.weatherId.startsWith("custom-")) {
          const weather = await prisma.customWeather.findUnique({
            where: { id: Number(validated.weatherId.replace("custom-", "")) },
          });
          if (!weather) {
            return c.json({ message: "Weather not found" }, 400);
          }
        }
      }

      let diariesTemplateWeathers;
      let diariesCustomWeathers;
      if (validated.weatherId) {
        if (validated.weatherId?.startsWith("template-")) {
          diariesTemplateWeathers = await prisma.diaryTemplateWeather.update({
            where: {
              diaryId: id,
            },
            data: {
              templateWeatherId: Number(
                validated.weatherId.replace("template-", ""),
              ),
            },
          });
        } else if (validated.weatherId?.startsWith("custom-")) {
          diariesCustomWeathers = await prisma.diaryCustomWeather.update({
            where: {
              diaryId: id,
            },
            data: {
              customWeatherId: Number(
                validated.weatherId.replace("custom-", ""),
              ),
            },
          });
        }
        delete validated.weatherId;
      }
      const diaryTemplateWeather = await prisma.diaryTemplateWeather.findFirst({
        where: { diaryId: id },
      });
      const templateWeather = await prisma.templateWeather.findFirst({
        where: { id: diariesTemplateWeathers?.templateWeatherId },
      });
      const diaryCustomWeather = await prisma.diaryCustomWeather.findFirst({
        where: { diaryId: id },
      });
      const customWeather = await prisma.customWeather.findFirst({
        where: { id: diariesCustomWeathers?.customWeatherId },
      });

      let diariesTemplateTasks;
      let diariesCustomTasks;
      if (validated.taskId) {
        if (validated.taskId.startsWith("template-")) {
          diariesTemplateTasks = await prisma.diaryTemplateTask.update({
            where: {
              diaryId: id,
            },
            data: {
              templateTaskId: Number(validated.taskId.replace("template-", "")),
            },
          });
        } else if (validated.taskId.startsWith("custom-")) {
          diariesCustomTasks = await prisma.diaryCustomTask.update({
            where: {
              diaryId: id,
            },
            data: {
              customTaskId: Number(validated.taskId.replace("custom-", "")),
            },
          });
        }
        delete validated.taskId;
      }
      const diaryTemplateTask = await prisma.diaryTemplateTask.findFirst({
        where: { diaryId: id },
      });
      const templateTask = await prisma.templateTask.findFirst({
        where: { id: diariesTemplateTasks?.templateTaskId },
      });
      const diaryCustomTask = await prisma.diaryCustomTask.findFirst({
        where: { diaryId: id },
      });
      const customTask = await prisma.customTask.findFirst({
        where: { id: diariesCustomTasks?.customTaskId },
      });

      if (validated.diaryPackId) {
        const diaryPack = await prisma.diaryPack.findFirst({
          where: { id: validated.diaryPackId },
        });
        if (!diaryPack) {
          return c.json({ message: "DiaryPack not found" }, 400);
        }
      }
      if (validated.workerId) {
        const user = await prisma.user.findFirst({
          where: { id: validated.workerId },
        });
        if (!user) {
          return c.json({ message: "workerId not found" }, 400);
        }
      }
      if (validated.registrerId) {
        const user = await prisma.user.findFirst({
          where: { id: validated.registrerId },
        });
        if (!user) {
          return c.json({ message: "registrerId not found" }, 400);
        }
      }

      diary = await prisma.diary.update({
        where: { id: id },
        data: validated,
      });

      return c.json(
        {
          ...diary,
          weatherId:
            "template-" + diaryTemplateWeather?.templateWeatherId ||
            "custom-" + diaryCustomWeather?.customWeatherId ||
            "あり得ない",
          weather: templateWeather?.name || customWeather?.name || "あり得ない",
          taskId:
            "template-" + diaryTemplateTask?.templateTaskId ||
            "custom-" + diaryCustomTask?.customTaskId ||
            "あり得ない",
          task: templateTask?.name || customTask?.name || "あり得ない",
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update a diary" }, 400);
    }
  })
  .openapi(routes.deleteDiary, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const diary = await prisma.diary.findFirst({
        where: { id: id },
      });
      if (!diary) {
        return c.json({ message: "Not found" }, 404);
      }
      if (!groupIds.includes(diary.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const diariesTemplateWeathers =
        await prisma.diaryTemplateWeather.findFirst({
          where: { diaryId: id },
        });
      if (diariesTemplateWeathers) {
        await prisma.diaryTemplateWeather.delete({
          where: { diaryId: id },
        });
      }
      const diariesCustomWeathers = await prisma.diaryCustomWeather.findFirst({
        where: { diaryId: id },
      });
      if (diariesCustomWeathers) {
        await prisma.diaryCustomWeather.delete({
          where: { diaryId: id },
        });
      }
      const diariesTemplateTasks = await prisma.diaryTemplateTask.findFirst({
        where: { diaryId: id },
      });
      if (diariesTemplateTasks) {
        await prisma.diaryTemplateTask.delete({
          where: { diaryId: id },
        });
      }
      const diariesCustomTasks = await prisma.diaryCustomTask.findFirst({
        where: { diaryId: id },
      });
      if (diariesCustomTasks) {
        await prisma.diaryCustomTask.delete({
          where: { diaryId: id },
        });
      }

      await prisma.diary.delete({
        where: { id: id },
      });
      return c.json({ message: "Diary deleted" });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete a diary" }, 500);
    }
  });
export default diaries;
