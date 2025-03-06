import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import { cors } from "hono/cors";

import { responseSchema } from "@/schema/response";

import { firebaseMiddleware } from "../firebaseMiddleware";
import { cars } from "./cars";
import diaries from "./diaries";
import diaryPacks from "./diaryPacks";
import fields from "./fields";
import groups from "./groups";
import ntripcasters from "./ntripcasters";
import roads from "./roads";
import users from "./users";

const prisma = new PrismaClient();

type Variables = {
  uid: string;
};

const routes = {
  hello: createRoute({
    method: "get",
    path: "/hello",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "hello",
      },
    },
  }),
};

const app = new OpenAPIHono<{ Variables: Variables }>();

const api = (
  app
    .use(
      "*",
      cors({
        origin: process.env.FRONTEND_URL
          ? ["http://localhost:8081", process.env.FRONTEND_URL]
          : ["http://localhost:8081"],
        allowHeaders: ["Origin", "Authorization", "Content-Type"],
        allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE"],
        exposeHeaders: [],
        credentials: true,
      }),
    )
    // allow preflight request
    // https://stackoverflow.com/questions/73803476/honojs-cors-with-cloudflare-worker
    .options("*", (c) => {
      c.status(204);
      return c.text("");
    })
    .get("connectivity-check", async (c) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (e) {
        console.error(e);
        return c.json({ message: "Failed" }, 500);
      }
      return c.json({ message: "OK" });
    })
    .use("*", firebaseMiddleware) as typeof app
)
  .openapi(routes.hello, async (c) => {
    const userId = c.get("uid");
    console.log({ userId });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log({ user });
    return c.json({ message: `You are id: ${user && "in db"}` });
  })
  .route("/users", users)
  .route("/groups", groups)
  .route("/ntripcasters", ntripcasters)
  .route("/diaries", diaries)
  .route("/diaryPacks", diaryPacks)
  .route("/fields", fields)
  .route("/roads", roads)
  .route("/cars", cars);

export default api;
