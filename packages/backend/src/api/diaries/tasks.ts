import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";

import { Variables } from "@/firebaseMiddleware";
import { responseSchema } from "@/schema/response";
import { taskResponseSchema, taskSchema } from "@/schema/task";

const prisma = new PrismaClient();

const routes = {
  getTasks: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: taskResponseSchema.array(),
          },
        },
        description: "List of tasks",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch tasks",
      },
    },
  }),
  registerTask: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: taskSchema.omit({
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
            schema: taskSchema,
          },
        },
        description: "Task created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create task",
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
  getTask: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: taskSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: taskResponseSchema,
          },
        },
        description: "Task details",
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
        description: "Task not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to fetch task",
      },
    },
  }),
  patchTask: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: taskSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: taskSchema
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
            schema: taskSchema,
          },
        },
        description: "Task updated",
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
        description: "Task not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to update task",
      },
    },
  }),
  deleteTask: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: taskSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Task deleted",
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
        description: "Task not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to delete task",
      },
    },
  }),
};

const tasks = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getTasks, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);

    try {
      const templateTasks = await prisma.templateTask.findMany({});
      const customTasks = await prisma.customTask.findMany({
        where: { groupId: { in: groupIds } },
      });
      return c.json(
        [
          ...templateTasks.map((t) => ({ ...t, id: "template-" + t.id })),
          ...customTasks.map((t) => ({ ...t, id: "custom-" + t.id })),
        ],
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch tasks" }, 500);
    }
  })
  .openapi(routes.registerTask, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const validated = c.req.valid("json");

    if (!groupIds.includes(validated.groupId)) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      const cropVariety = await prisma.cropGroup.findUnique({
        where: { id: validated.cropGroupId },
      });
      if (!cropVariety) {
        return c.json({ message: "Crop group not found" }, 400);
      }
      if (!groupIds.includes(cropVariety.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const task = await prisma.customTask.create({
        data: {
          ...validated,
        },
      });
      return c.json({ ...task, id: "custom-" + task.id }, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create task" }, 400);
    }
  })
  .openapi(routes.getTask, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = taskSchema.shape.id.safeParse(c.req.param("id"));
    if (!param.success) {
      return c.json({ message: "Invalid id param" }, 400);
    }
    const id = param.data;

    try {
      if (id.startsWith("template-")) {
        const task = await prisma.templateTask.findFirst({
          where: { id: Number(id.replace("template-", "")) },
        });
        if (!task) {
          return c.json({ message: "Task not found" }, 404);
        }
        return c.json({ ...task, id: "template-" + task.id }, 200);
      } else if (id.startsWith("custom-")) {
        const task = await prisma.customTask.findFirst({
          where: { id: Number(id.replace("custom-", "")) },
        });
        if (!task) {
          return c.json({ message: "Task not found" }, 404);
        }
        if (!groupIds.includes(task.groupId)) {
          return c.json({ message: "Forbidden" }, 403);
        }
        return c.json({ ...task, id: "custom-" + task.id }, 200);
      }
      return c.json({ message: "Invalid task id" }, 400);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to fetch task" }, 500);
    }
  })
  .openapi(routes.patchTask, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = taskSchema.shape.id.safeParse(c.req.param("id"));
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
      return c.json({ message: "A template task cannot be updated" }, 400);
    }

    try {
      let task = await prisma.customTask.findFirst({
        where: { id: Number(id.replace("custom-", "")) },
      });
      if (!task) {
        return c.json({ message: "Not found" }, 404);
      }
      if (!groupIds.includes(task.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      task = await prisma.customTask.update({
        where: { id: Number(id.replace("custom-", "")) },
        data: validated,
      });
      return c.json({ ...task, id: "custom-" + task.id }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update task" }, 400);
    }
  })
  .openapi(routes.deleteTask, async (c) => {
    const groups = c.get("groupIds");
    const groupIds = groups.map((g) => g.groupId);
    const param = taskSchema.shape.id.safeParse(c.req.param("id"));
    if (!param.success) {
      return c.json({ message: "Invalid id param" }, 400);
    }
    const id = param.data;

    if (id.startsWith("template-")) {
      return c.json({ message: "A template task cannot be deleted" }, 400);
    }

    try {
      const task = await prisma.customTask.findFirst({
        where: { id: Number(id.replace("custom-", "")) },
      });
      if (!task) {
        return c.json({ message: "Task not found" }, 404);
      }
      if (!groupIds.includes(task.groupId)) {
        return c.json({ message: "Forbidden" }, 403);
      }

      await prisma.customTask.delete({
        where: { id: Number(id.replace("custom-", "")) },
      });
      return c.json({ message: "Task deleted" });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete task" }, 400);
    }
  });

export default tasks;
