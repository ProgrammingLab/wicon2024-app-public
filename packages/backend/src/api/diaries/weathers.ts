import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { responseSchema } from "@/schema/response";
import { weatherResponseSchema, weatherSchema } from "@/schema/weather";

const prisma = new PrismaClient();

const routes = {
  getWeathers: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: weatherResponseSchema.array(),
          },
        },
        description: "List of weathers",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch weathers",
      },
    },
  }),
  registerWeather: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: weatherSchema.omit({
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
            schema: weatherSchema,
          },
        },
        description: "Weather created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create weather",
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
  getWeather: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: weatherSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: weatherResponseSchema,
          },
        },
        description: "Weather",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Invalid id param",
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
        description: "Weather not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch weather",
      },
    },
  }),
  patchWeather: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: weatherSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: weatherSchema
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
            schema: weatherSchema,
          },
        },
        description: "Weather updated",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Invalid id param",
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
        description: "Weather not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update weather",
      },
    },
  }),
  deleteWeather: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: weatherSchema.pick({ id: true }),
    },
    responses: {
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Invalid id param",
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
        description: "Weather not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete weather",
      },
    },
  }),
};

const weathers = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getWeathers, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const templateWeathers = await prisma.templateWeather.findMany({});
      const customWeathers = await prisma.customWeather.findMany({
        where: { groupId: { in: groupIds } },
      });
      return c.json(
        [
          ...templateWeathers.map((w) => ({
            ...w,
            id: "template-" + w.id,
          })),
          ...customWeathers.map((w) => ({
            ...w,
            id: "custom-" + w.id,
          })),
        ],
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch weathers" }, 500);
    }
  })
  .openapi(routes.registerWeather, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      const weather = await prisma.customWeather.create({
        data: {
          ...validated,
        },
      });
      return c.json(
        {
          ...weather,
          id: "custom-" + weather.id,
        },
        201,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create weather" }, 400);
    }
  })
  .openapi(routes.getWeather, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = weatherSchema.shape.id.safeParse(c.req.param("id"));
    if (!param.success) {
      return c.json({ message: "Invalid id param" }, 400);
    }
    const id = param.data;

    try {
      if (id.startsWith("template-")) {
        const weather = await prisma.templateWeather.findFirst({
          where: { id: Number(id.replace("template-", "")) },
        });
        if (!weather) {
          return c.json({ message: "Weather not found" }, 404);
        }
        return c.json({ ...weather, id: "template-" + weather.id }, 200);
      } else if (id.startsWith("custom-")) {
        const weather = await prisma.customWeather.findFirst({
          where: { id: Number(id.replace("custom-", "")) },
        });
        if (!weather) {
          return c.json({ message: "Weather not found" }, 404);
        }
        if (!groupIds.includes(weather.groupId)) {
          return c.json({ message: "Forbidden" }, 403);
        }
        return c.json({ ...weather, id: "custom-" + weather.id }, 200);
      }
      return c.json({ message: "Invalid id format" }, 400);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch weather" }, 500);
    }
  })
  .openapi(routes.patchWeather, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = weatherSchema.shape.id.safeParse(c.req.param("id"));
    if (!param.success) {
      return c.json({ message: "Invalid id param" }, 400);
    }
    const id = param.data;
    const validated = c.req.valid("json");

    if (validated.groupId) {
      if (!groupIds.includes(validated.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
    }

    if (id.startsWith("template-")) {
      return c.json({ message: "A weather template is not editable." }, 403);
    }

    try {
      const weather = await prisma.customWeather.findFirst({
        where: { id: Number(id.replace("custom-", "")) },
      });
      if (!weather) {
        return c.json({ message: "Weather not found" }, 404);
      }
      if (!groupIds.includes(weather.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      const res = await prisma.customWeather.update({
        where: { id: Number(id.replace("custom-", "")) },
        data: validated,
      });
      return c.json({ ...res, id: "custom-" + res.id }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update weather" }, 400);
    }
  })
  .openapi(routes.deleteWeather, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = weatherSchema.shape.id.safeParse(c.req.param("id"));
    if (!param.success) {
      return c.json({ message: "Invalid id param" }, 400);
    }
    const id = param.data;

    if (id.startsWith("template-")) {
      return c.json({ message: "A weather template is not deletable." }, 403);
    }

    try {
      const weather = await prisma.customWeather.findFirst({
        where: { id: Number(id.replace("custom-", "")) },
      });
      if (!weather) {
        return c.json({ message: "Weather not found" }, 404);
      }
      if (!groupIds.includes(weather.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }
      await prisma.customWeather.delete({
        where: { id: Number(id.replace("custom-", "")) },
      });
      return c.json({ message: "Weather deleted" });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete weather" }, 400);
    }
  });

export default weathers;
