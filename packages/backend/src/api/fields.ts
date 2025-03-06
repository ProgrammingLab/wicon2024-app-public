/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import {
  createAField,
  deleteAFieldWithId,
  deleteRoadsByFieldId,
  getAFieldWithId,
  getAllFieldsWithGroupId,
  getAllRoadsWithFieldId,
  getAllRoadsWithGroupId,
  getLastId,
  updateFieldAreaWithId,
  updateFieldCoordinateWithId,
  updateFieldGroupIdWithId,
  updateFieldNameWithId,
} from "@prisma/client/sql";

import { Variables } from "@/firebaseMiddleware";
import { fieldSchema } from "@/schema/field";
import { responseSchema } from "@/schema/response";

const prisma = new PrismaClient();

export const polygonString2Object = (polygon: string | null) => {
  if (!polygon) {
    return [];
  }
  return polygon
    .slice(1, -1)
    .replace(" ", "")
    .split("),(")
    .map((c) => {
      const [lat, lon] = c.replace("(", "").replace(")", "").split(",");
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    });
};

const polygonObject2String = (polygon: { lat: number; lon: number }[]) => {
  return `(${polygon.map((c) => `(${c.lat}, ${c.lon})`).join(", ")})`;
};

const routes = {
  getFields: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: fieldSchema.array(),
          },
        },
        description: "List of fields",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch fields",
      },
    },
  }),
  registerField: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: fieldSchema.omit({
              id: true,
              updatedAt: true,
              createdAt: true,
            }),
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: fieldSchema.pick({
              id: true,
            }),
          },
        },
        description: "Field created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create field",
      },
      403: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Forbidden",
      },
    },
  }),
  getField: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: fieldSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: fieldSchema,
          },
        },
        description: "Field found",
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
        description: "Field not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch field",
      },
    },
  }),
  patchField: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: fieldSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: fieldSchema
              .omit({ id: true, updatedAt: true, createdAt: true })
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
            schema: fieldSchema,
          },
        },
        description: "Field updated",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update field",
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
        description: "Field not found",
      },
    },
  }),
  deleteField: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: fieldSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Field deleted",
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
        description: "Field not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete field",
      },
    },
  }),
};

const fields = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getFields, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const fields = await prisma.$queryRawTyped(
        getAllFieldsWithGroupId(groupIds),
      );
      return c.json(
        fields.map((f) => ({
          ...f,
          coordinate: polygonString2Object(f.coordinate),
        })),
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch fields" }, 500);
    }
  })
  .openapi(routes.registerField, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }
    try {
      await prisma.$queryRawTyped(
        createAField(
          validated.name,
          validated.groupId,
          validated.area,
          polygonObject2String(validated.coordinate),
        ),
      );
      const result = await prisma.$queryRawTyped(getLastId());
      return c.json({ id: Number(result[0].lastval) }, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create field" }, 400);
    }
  })
  .openapi(routes.getField, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const [field] = await prisma.$queryRawTyped(getAFieldWithId(id));
      if (!field) {
        return c.json({ message: "Field not found" }, 404);
      }
      if (!groupIds.includes(field.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      return c.json(
        {
          ...field,
          coordinate: polygonString2Object(field.coordinate),
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch field" }, 500);
    }
  })
  .openapi(routes.patchField, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));
    const validated = c.req.valid("json");

    try {
      const [field] = await prisma.$queryRawTyped(getAFieldWithId(id));
      if (!field) {
        return c.json({ message: "Field not found" }, 404);
      }
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update field" }, 400);
    }

    if (validated.groupId) {
      if (!groupIds.includes(validated.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
    }
    try {
      if (validated.name) {
        await prisma.$queryRawTyped(updateFieldNameWithId(id, validated.name));
      }
      if (validated.groupId) {
        await prisma.$queryRawTyped(
          updateFieldGroupIdWithId(id, validated.groupId),
        );
      }
      if (validated.area) {
        await prisma.$queryRawTyped(updateFieldAreaWithId(id, validated.area));
      }
      if (validated.coordinate) {
        await prisma.$queryRawTyped(
          updateFieldCoordinateWithId(
            id,
            polygonObject2String(validated.coordinate),
          ),
        );
      }
      const [updatedField] = await prisma.$queryRawTyped(getAFieldWithId(id));

      return c.json(
        {
          ...updatedField,
          coordinate: polygonString2Object(updatedField.coordinate),
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update field" }, 400);
    }
  })
  .openapi(routes.deleteField, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const [field] = await prisma.$queryRawTyped(getAFieldWithId(id));
      if (!field) {
        return c.json({ message: "Field not found" }, 404);
      }
      if (!groupIds.includes(field.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const diaryPacks = await prisma.diaryPack.findMany({
        where: { fieldId: id },
      });
      if (diaryPacks.length > 0) {
        return c.json(
          { message: "Delete diaryPack using this field first" },
          400,
        );
      }

      const roads = await prisma.$queryRawTyped(getAllRoadsWithFieldId(id));
      if (roads.length > 0) {
        await prisma.$queryRawTyped(deleteRoadsByFieldId(id));
      }

      await prisma.$queryRawTyped(deleteAFieldWithId(id));
      return c.json({ message: "Field deleted" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete field" }, 500);
    }
  });
export default fields;
