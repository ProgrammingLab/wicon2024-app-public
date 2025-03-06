import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import {
  createARoad,
  deleteARoadWithId,
  getAFieldWithId,
  getAllRoadsWithGroupId,
  getARoadWithId,
  updateRoadCoordinatesWithId,
  updateRoadFieldIdWithId,
  updateRoadGroupIdWithId,
  updateRoadNameWithId,
} from "@prisma/client/sql";

import { Variables } from "@/firebaseMiddleware";
import { responseSchema } from "@/schema/response";
import { roadSchema } from "@/schema/road";

import { polygonString2Object } from "./fields";

const prisma = new PrismaClient();

const openedPathString2Object = polygonString2Object;

const openedPathObject2String = (
  coordinate: { lat: number; lon: number }[],
) => {
  return `[${coordinate.map((c) => `(${c.lat}, ${c.lon})`).join(", ")}]`;
};

const routes = {
  getRoads: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: roadSchema.array(),
          },
        },
        description: "List of roads",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch roads",
      },
    },
  }),
  registerRoad: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: roadSchema.omit({
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
            schema: responseSchema,
          },
        },
        description: "Road created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create road",
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
  getRoad: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: roadSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: roadSchema,
          },
        },
        description: "Road fetched",
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
        description: "Road not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch road",
      },
    },
  }),
  patchRoad: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: roadSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: roadSchema
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
            schema: roadSchema,
          },
        },
        description: "Road updated",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update road",
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
        description: "Road not found",
      },
    },
  }),
  deleteRoad: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: roadSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Road deleted",
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
        description: "Road not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete road",
      },
    },
  }),
};

const roads = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getRoads, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const roads = await prisma.$queryRawTyped(
        getAllRoadsWithGroupId(groupIds),
      );
      return c.json(
        roads.map((r) => ({
          ...r,
          coordinates: openedPathString2Object(r.coordinates),
        })),
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch roads" }, 500);
    }
  })
  .openapi(routes.registerRoad, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }
    try {
      await prisma.$queryRawTyped(
        createARoad(
          validated.name,
          validated.groupId,
          validated.fieldId,
          openedPathObject2String(validated.coordinates),
        ),
      );
      return c.json({ message: "Road created" }, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create road" }, 400);
    }
  })
  .openapi(routes.getRoad, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const [road] = await prisma.$queryRawTyped(getARoadWithId(id));
      if (!groupIds.includes(road.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      return c.json(
        {
          ...road,
          coordinates: openedPathString2Object(road.coordinates),
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch road" }, 500);
    }
  })
  .openapi(routes.patchRoad, async (c) => {
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
      let [road] = await prisma.$queryRawTyped(getARoadWithId(id));
      if (!road) {
        return c.json({ message: "Road not found" }, 404);
      }
      if (!groupIds.includes(road.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      if (validated.fieldId) {
        const [field] = await prisma.$queryRawTyped(getAFieldWithId(id));
        if (!field) {
          return c.json({ message: "Field not found" }, 404);
        }
        if (!groupIds.includes(field.groupId)) {
          return c.json({ message: "Forbidden" }, 403);
        }
      }

      if (validated.name) {
        await prisma.$queryRawTyped(updateRoadNameWithId(id, validated.name));
      }
      if (validated.groupId) {
        await prisma.$queryRawTyped(
          updateRoadGroupIdWithId(id, validated.groupId),
        );
      }
      if (validated.fieldId) {
        await prisma.$queryRawTyped(
          updateRoadFieldIdWithId(id, validated.fieldId),
        );
      }
      if (validated.coordinates) {
        await prisma.$queryRawTyped(
          updateRoadCoordinatesWithId(
            id,
            openedPathObject2String(validated.coordinates),
          ),
        );
      }

      [road] = await prisma.$queryRawTyped(getARoadWithId(id));
      return c.json(
        {
          ...road,
          coordinates: openedPathString2Object(road.coordinates),
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update road" }, 400);
    }
  })
  .openapi(routes.deleteRoad, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const [road] = await prisma.$queryRawTyped(getARoadWithId(id));
      if (!road) {
        return c.json({ message: "Road not found" }, 404);
      }
      if (!groupIds.includes(road.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      await prisma.$queryRawTyped(deleteARoadWithId(id));
      return c.json({ message: "Road deleted" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete road" }, 500);
    }
  });

export default roads;
