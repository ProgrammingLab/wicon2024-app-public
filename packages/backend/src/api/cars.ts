import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { carSchema } from "@/schema/car";
import { responseSchema } from "@/schema/response";

const prisma = new PrismaClient();

const routes = {
  getCars: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: carSchema.array(),
          },
        },
        description: "List of cars",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch cars",
      },
    },
  }),
  registerCar: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: carSchema.omit({
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
            schema: carSchema,
          },
        },
        description: "Car created",
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
        description: "Failed to create car",
      },
    },
  }),
  getCar: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: carSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: carSchema,
          },
        },
        description: "Car",
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
        description: "Car not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch car",
      },
    },
  }),
  patchCar: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: carSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: carSchema
              .omit({ id: true, createdAt: true, updatedAt: true })
              .partial()
              .refine((c) => Object.keys(c).length > 0),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: carSchema,
          },
        },
        description: "Car updated",
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
        description: "Car not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update car",
      },
    },
  }),
  deleteCar: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: carSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Car deleted",
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
        description: "Car not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete car",
      },
    },
  }),
};

export const cars = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getCars, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const cars = await prisma.car.findMany({
        where: {
          groupId: { in: groupIds },
        },
      });
      return c.json(cars, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch cars" }, 500);
    }
  })
  .openapi(routes.registerCar, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      const car = await prisma.car.create({
        data: validated,
      });
      return c.json(car, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create car" }, 500);
    }
  })
  .openapi(routes.getCar, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const car = await prisma.car.findFirst({
        where: {
          id: id,
        },
      });
      if (!car) {
        return c.json({ message: "Car not found" }, 404);
      }
      if (!groupIds.includes(car.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      return c.json(car, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch car" }, 500);
    }
  })
  .openapi(routes.patchCar, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));
    const validated = c.req.valid("json");

    try {
      const car = await prisma.car.findFirst({
        where: {
          id: id,
        },
      });
      if (!car) {
        return c.json({ message: "Car not found" }, 404);
      }
      if (!groupIds.includes(car.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      if (validated.groupId) {
        if (!groupIds.includes(validated.groupId)) {
          return c.json({ message: "Forbidden" }, 403);
        }
      }
      const res = await prisma.car.update({
        where: {
          id: id,
        },
        data: validated,
      });
      return c.json(res, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update car" }, 500);
    }
  })
  .openapi(routes.deleteCar, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const id = Number(c.req.param("id"));

    try {
      const car = await prisma.car.findFirst({
        where: {
          id: id,
        },
      });
      if (!car) {
        return c.json({ message: "Car not found" }, 404);
      }
      if (!groupIds.includes(car.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      await prisma.car.delete({
        where: {
          id: id,
        },
      });
      return c.json(
        {
          message: "Car deleted",
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete car" }, 500);
    }
  });
