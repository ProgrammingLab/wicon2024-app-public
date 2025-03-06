import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "firebase-admin/auth";
import { HTTPException } from "hono/http-exception";

import { groupResponseSchema, groupSchema } from "@/schema/group";
import { responseSchema } from "@/schema/response";

import { firebase } from "..";

const prisma = new PrismaClient();

type Variables = {
  uid: string;
  groupIds: {
    userId: string;
    groupId: number;
    role: string;
  }[];
};

const routes = {
  registerGroup: createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: groupSchema.omit({
              id: true,
              createdAt: true,
              updatedAt: true,
            }),
          },
        },
      },
    },
    security: [{ Bearer: [] }],
    responses: {
      201: {
        content: {
          "application/json": {
            schema: groupSchema,
          },
        },
        description: "Group created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Failed to create group",
      },
    },
  }),
  getGroup: createRoute({
    method: "get",
    path: "/{id}",
    request: {
      params: groupSchema.pick({ id: true }),
    },
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: groupResponseSchema,
          },
        },
        description: "Group info",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Group not found",
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
};

const app = new OpenAPIHono<{ Variables: Variables }>();

const groups = (
  app.use("/:id/*", async (c, next) => {
    const groupId = Number(c.req.param("id"));
    const groupIds = c.get("groupIds");

    if (!groupIds) {
      throw new HTTPException(401, { message: "Unauthorized" });
    } else if (!groupIds.map((g) => g.groupId).includes(groupId)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    await next();
  }) as typeof app
)
  .openapi(routes.registerGroup, async (c) => {
    const data = c.req.valid("json");

    const user = c.get("uid");
    try {
      const group = await prisma.group.create({ data: { name: data.name } });

      try {
        await prisma.groupUserRole.create({
          data: { userId: user, groupId: group.id, role: "superadmin" },
        });

        return c.json(group, 201);
      } catch (e) {
        await prisma.group.delete({ where: { id: group.id } });
        console.error(e);
        return c.json({ message: "Failed to create groupUserRole" }, 400);
      }
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create group" }, 400);
    }
  })
  .openapi(routes.getGroup, async (c) => {
    try {
      const groupId = Number(c.req.param("id"));
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) {
        return c.json({ message: "Group not found" }, 404);
      }
      const groupUsers = await prisma.groupUserRole.findMany({
        where: { groupId: groupId },
      });
      const displayNames = await Promise.all(
        groupUsers.map(
          async (u) => (await getAuth(firebase).getUser(u.userId)).displayName,
        ),
      );
      return c.json(
        {
          ...group,
          users: groupUsers.map((u, index) => ({
            id: u.userId,
            role: u.role,
            name: displayNames[index] || "Unknown",
          })),
        },
        200,
      );
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  });
export default groups;
