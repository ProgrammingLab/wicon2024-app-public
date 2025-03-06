import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { cropGroupResponseSchema, cropGroupSchema } from "@/schema/cropGroup";
import { responseSchema } from "@/schema/response";

const routes = {
  getCropGroups: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: cropGroupResponseSchema.array(),
          },
        },
        description: "List of crop groups",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Something went wrong",
      },
    },
  }),
  registerCropGroup: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: cropGroupSchema.omit({
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
            schema: cropGroupResponseSchema,
          },
        },
        description: "Created crop group",
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
        description: "Failed to create crop group",
      },
    },
  }),
  getCropGroup: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropGroupSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: cropGroupResponseSchema,
          },
        },
        description: "Crop group",
      },
      404: {
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
        description: "Something went wrong",
      },
    },
  }),
  patchCropGroup: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropGroupSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: cropGroupSchema
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
            schema: cropGroupResponseSchema,
          },
        },
        description: "Updated crop group",
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
        description: "Crop group not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update crop group",
      },
    },
  }),
  deleteCropGroup: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: cropGroupSchema.pick({ id: true }),
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

const prisma = new PrismaClient();

const cropGroups = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getCropGroups, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const cropGroups = await prisma.cropGroup.findMany({
        where: { groupId: { in: groupIds } },
      });
      const res = [];
      for (const cropGroup of cropGroups) {
        const crops = await prisma.crop.findMany({
          where: { cropGroupId: cropGroup.id },
        });
        res.push({ ...cropGroup, crops });
      }

      return c.json(res, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong." }, 500);
    }
  })
  .openapi(routes.registerCropGroup, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    try {
      if (!groupIds.includes(validated.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      const cropGroup = await prisma.cropGroup.create({
        data: {
          ...validated,
        },
      });
      const crops = await prisma.crop.findMany({
        where: { cropGroupId: cropGroup.id },
      });
      return c.json({ ...cropGroup, crops }, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong." }, 500);
    }
  })
  .openapi(routes.getCropGroup, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const cropGroup = await prisma.cropGroup.findFirst({
        where: { id: id },
      });
      if (!cropGroup) {
        return c.json({ message: "Crop group not found" }, 404);
      }
      if (!groupIds.includes(cropGroup.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const crops = await prisma.crop.findMany({
        where: { cropGroupId: cropGroup.id },
      });
      return c.json({ ...cropGroup, crops }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong." }, 500);
    }
  })
  .openapi(routes.patchCropGroup, async (c) => {
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
      let cropGroup = await prisma.cropGroup.findFirst({
        where: { id: id },
      });
      if (!cropGroup) {
        return c.json({ message: "Crop group not found" }, 404);
      }
      if (!groupIds.includes(cropGroup.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      cropGroup = await prisma.cropGroup.update({
        where: { id: id },
        data: validated,
      });

      const crops = await prisma.crop.findMany({
        where: { cropGroupId: cropGroup.id },
      });
      return c.json(
        {
          ...cropGroup,
          crops,
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update crop" }, 500);
    }
  })
  .openapi(routes.deleteCropGroup, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const cropGroup = await prisma.cropGroup.findFirst({
        where: { id: id },
      });
      if (!cropGroup) {
        return c.json({ message: "Crop group not found" }, 404);
      }
      if (!groupIds.includes(cropGroup.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const crop = await prisma.crop.findFirst({
        where: { cropGroupId: id },
      });
      if (crop) {
        return c.json({ message: "Delete associated crop first" }, 403);
      }

      const customTask = await prisma.customTask.findFirst({
        where: { cropGroupId: id },
      });
      if (customTask) {
        return c.json({ message: "Delete associated custom task first" }, 403);
      }

      await prisma.cropGroup.delete({
        where: { id: id },
      });
      return c.json({ message: "Deleted crop group" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete crop group" }, 500);
    }
  });

export default cropGroups;
