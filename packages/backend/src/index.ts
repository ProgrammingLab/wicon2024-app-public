import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";

import api from "./api";
import { responseSchema } from "./schema/response";

const app = new OpenAPIHono();

let firebaseConfig = {};
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.log("!!!! Using Firebase Auth Emulator !!!!");
  console.log("->", process.env.FIREBASE_AUTH_EMULATOR_HOST);
  firebaseConfig = { projectId: "wicon2024" };
} else {
  firebaseConfig = {
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  };
}
export const firebase = initializeApp(firebaseConfig);

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const routes = app
  .route("/api", api)
  .openapi(
    createRoute({
      method: "get",
      path: "/",
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
    (c) => {
      return c.json({
        message: "hello",
      });
    },
  )
  .doc31("/docs", { openapi: "3.1.0", info: { title: "foo", version: "1" } })
  .get("/ui", swaggerUI({ url: "/docs" }));

export default app;
