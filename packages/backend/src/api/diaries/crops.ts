import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { cropSchema } from "@/schema/crop";
import { responseSchema } from "@/schema/response";

const prisma = new PrismaClient();

const routes = {
  getCrops: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: cropSchema.array(),
          },
        },
        description: "List of crops",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch crops",
      },
    },
  }),
  registerCrop: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: cropSchema.omit({
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
            schema: cropSchema,
          },
        },
        description: "Created crop",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Crop group not found",
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
        description: "Failed to create crop",
      },
    },
  }),
  getCrop: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: cropSchema,
          },
        },
        description: "Crop",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Crop not found",
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
        description: "Failed to fetch crop",
      },
    },
  }),
  patchCrop: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: cropSchema
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
            schema: cropSchema,
          },
        },
        description: "Updated crop",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update crop",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Crop group not found",
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
        description: "Crop not found",
      },
    },
  }),
  deleteCrop: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Deleted crop",
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
        description: "Crop not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete crop",
      },
    },
  }),
};

const crops = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getCrops, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const crops = await prisma.crop.findMany({
        where: { groupId: { in: groupIds } },
      });
      return c.json(crops, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch crops" }, 500);
    }
  })
  .openapi(routes.registerCrop, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    try {
      if (!groupIds.includes(validated.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      const cropGroup = await prisma.cropGroup.findFirst({
        where: { id: validated.cropGroupId },
      });
      if (!cropGroup) {
        return c.json({ message: "Crop group not found" }, 400);
      }

      const crops = await prisma.crop.create({
        data: {
          ...validated,
        },
      });
      return c.json(crops, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create crop" }, 500);
    }
  })
  .openapi(routes.getCrop, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const crop = await prisma.crop.findFirst({
        where: { id: id },
      });
      if (!crop) {
        return c.json({ message: "Crop not found" }, 404);
      }
      if (!groupIds.includes(crop.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      return c.json(crop, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch crop" }, 500);
    }
  })
  .openapi(routes.patchCrop, async (c) => {
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
      let crop = await prisma.crop.findFirst({
        where: { id: id },
      });
      if (!crop) {
        return c.json({ message: "Crop not found" }, 404);
      }
      if (!groupIds.includes(crop.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      if (validated.cropGroupId) {
        const cropGroup = await prisma.cropGroup.findFirst({
          where: { id: validated.cropGroupId },
        });
        if (!cropGroup) {
          return c.json({ message: "Crop group not found" }, 400);
        }
      }

      crop = await prisma.crop.update({
        where: { id: id },
        data: validated,
      });
      return c.json(crop, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update crop" }, 500);
    }
  })
  .openapi(routes.deleteCrop, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const crop = await prisma.crop.findFirst({
        where: { id: id },
      });
      if (!crop) {
        return c.json({ message: "Crop not found" }, 404);
      }
      if (!groupIds.includes(crop.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const diaryPack = await prisma.diaryPack.findFirst({
        where: { cropId: id },
      });
      if (diaryPack) {
        return c.json({ message: "Delete associated diary pack first" }, 403);
      }

      await prisma.crop.delete({
        where: { id: id },
      });
      return c.json({ message: "Deleted crop" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete crop" }, 500);
    }
  });

export default crops;
