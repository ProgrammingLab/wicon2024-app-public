import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { PrismaClient, Role } from "@prisma/client";
import { getAuth } from "firebase-admin/auth";
import { HTTPException } from "hono/http-exception";

import { responseSchema } from "@/schema/response";
import { userSchema } from "@/schema/user";

import { firebase } from "..";

const prisma = new PrismaClient();

type Variables = {
  uid: string;
};

const routes = {
  getUser: createRoute({
    method: "get",
    path: "/{id}",
    request: {
      params: userSchema.pick({ id: true }),
    },
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User information",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "User not found",
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
  getUserGroups: createRoute({
    method: "get",
    path: "/{id}/groups",
    request: {
      params: userSchema.pick({ id: true }),
    },
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                userId: z.string(),
                groupId: z.number(),
                role: z.nativeEnum(Role),
              }),
            ),
          },
        },
        description: "User's groups",
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
  registerUser: createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: userSchema.omit({ createdAt: true, updatedAt: true }),
            example: {
              id: "xdumPg9v0Wws6db8D8gtdGU6gePh",
              country: "Japan",
            },
          },
        },
        required: true,
      },
    },
    security: [{ Bearer: [] }],
    responses: {
      201: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "User already exists",
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
  patchUser: createRoute({
    method: "patch",
    path: "/{id}",
    request: {
      params: userSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: userSchema
              .omit({ id: true, createdAt: true, updatedAt: true })
              .partial()
              .refine((values) => !!values && Object.keys(values).length > 0),
          },
        },
        required: true,
      },
    },
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User updated",
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
  deleteUser: createRoute({
    method: "delete",
    path: "/{id}",
    request: {
      params: userSchema.pick({ id: true }),
    },
    security: [{ Bearer: [] }],
    responses: {
      204: {
        description: "User deleted",
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

const users = (
  app
    // 認証されているuidtとリクエストされたuidが一致するか確認
    .use("/:id/*", async (c, next) => {
      const paramId = c.req.param("id");
      const authId = c.get("uid");

      if (paramId !== authId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      await next();
    }) as typeof app
)
  // ユーザー情報取得
  .openapi(routes.getUser, async (c) => {
    const id = c.req.param("id");

    try {
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        return c.json({ message: "User not found" }, 404);
      }
      return c.json(user, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  // ユーザの所属するグループ情報取得
  .openapi(routes.getUserGroups, async (c) => {
    const id = c.req.param("id");

    try {
      const groups = await prisma.groupUserRole.findMany({
        where: { userId: id },
      });
      return c.json(groups, 200);
    } catch (e) {
      console.debug(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  // ユーザー作成
  .openapi(routes.registerUser, async (c) => {
    const data = c.req.valid("json");
    try {
      const user = await prisma.user.findUnique({ where: { id: data.id } });

      if (user) {
        return c.json(
          {
            message: "User already exists",
          },
          400,
        );
      } else {
        const res = await prisma.user.create({
          data: {
            id: data.id,
            country: data.country,
          },
        });
        return c.json(res, 201);
      }
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  // ユーザー情報更新
  .openapi(routes.patchUser, async (c) => {
    const data = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const user = await prisma.user.update({
        where: { id: id },
        data: data,
      });
      return c.json(user, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  .openapi(routes.deleteUser, async (c) => {
    const id = c.req.param("id");

    try {
      await getAuth(firebase).deleteUser(id);
      await prisma.groupUserRole.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id: id } });
      c.status(204);
      return c.text("");
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  });
export default users;
