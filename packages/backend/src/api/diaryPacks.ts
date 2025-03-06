import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { diaryPackSchema } from "@/schema/diaryPack";
import { responseSchema } from "@/schema/response";

const prisma = new PrismaClient();

const routes = {
  getDiaryPacks: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: diaryPackSchema.array(),
          },
        },
        description: "List of diaryPacks",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch diaryPacks",
      },
    },
  }),
  registerDiaryPack: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: diaryPackSchema.omit({
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
            schema: diaryPackSchema,
          },
        },
        description: "DiaryPack created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create diaryPack",
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
        description: "Failed to create diaryPack",
      },
    },
  }),
  getDiaryPack: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diaryPackSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: diaryPackSchema,
          },
        },
        description: "DiaryPack",
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
        description: "DiaryPack not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch diaryPack",
      },
    },
  }),
  patchDiaryPack: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diaryPackSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: diaryPackSchema
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
            schema: diaryPackSchema,
          },
        },
        description: "DiaryPack updated",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update diaryPack",
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
        description: "DiaryPack not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update diaryPack",
      },
    },
  }),
  deleteDiaryPack: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: diaryPackSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "DiaryPack deleted",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Please delete all diaries in this diaryPack first",
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
        description: "DiaryPack not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete diaryPack",
      },
    },
  }),
};

const diaryPacks = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getDiaryPacks, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const diaryPacks = await prisma.diaryPack.findMany({
        where: { groupId: { in: groupIds } },
      });
      return c.json(diaryPacks, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch diaryPacks" }, 500);
    }
  })
  .openapi(routes.registerDiaryPack, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      const group = await prisma.group.findUnique({
        where: { id: validated.groupId },
      });
      if (!group) {
        return c.json({ message: "Group not found" }, 400);
      }

      const crop = await prisma.crop.findUnique({
        where: { id: validated.cropId },
      });
      if (!crop) {
        return c.json({ message: "crop not found" }, 400);
      }

      const field = await prisma.field.findUnique({
        where: { id: validated.fieldId },
      });
      if (!field) {
        return c.json({ message: "Field not found" }, 400);
      }

      const diaryPack = await prisma.diaryPack.create({
        data: validated,
      });
      return c.json(diaryPack, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create diaryPack" }, 500);
    }
  })
  .openapi(routes.getDiaryPack, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const diaryPack = await prisma.diaryPack.findFirst({
        where: { id: id },
      });
      if (!diaryPack) {
        return c.json({ message: "DiaryPack not found" }, 404);
      }
      if (!groupIds.includes(diaryPack.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      return c.json(diaryPack, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch diaryPack" }, 500);
    }
  })
  .openapi(routes.patchDiaryPack, async (c) => {
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
      const diaryPackCheck = await prisma.diaryPack.findFirst({
        where: { id },
      });
      if (!diaryPackCheck) {
        return c.json({ message: "DiaryPack not found" }, 404);
      }

      if (validated.cropId) {
        const crop = await prisma.crop.findUnique({
          where: { id: validated.cropId },
        });
        if (!crop) {
          return c.json({ message: "crop not found" }, 400);
        }
      }
      if (validated.fieldId) {
        const field = await prisma.field.findUnique({
          where: { id: validated.fieldId },
        });
        if (!field) {
          return c.json({ message: "Field not found" }, 400);
        }
      }

      const diaryPack = await prisma.diaryPack.update({
        where: { id },
        data: validated,
      });

      return c.json(diaryPack, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update diaryPack" }, 500);
    }
  })
  .openapi(routes.deleteDiaryPack, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const diaryPack = await prisma.diaryPack.findFirst({
        where: { id },
      });
      if (!diaryPack) {
        return c.json({ message: "DiaryPack not found" }, 404);
      }
      if (!groupIds.includes(diaryPack.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const diaries = await prisma.diary.findMany({
        where: { diaryPackId: id },
      });
      if (diaries.length > 0) {
        return c.json(
          { message: "Please delete all diaries in this diaryPack first" },
          400,
        );
      }

      await prisma.diaryPack.delete({
        where: { id },
      });

      return c.json({ message: "DiaryPack deleted" });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete diaryPack" }, 500);
    }
  });

export default diaryPacks;
