import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { PrismaClient } from "@prisma/client";
import { $ } from "bun";
import { HTTPException } from "hono/http-exception";

import { ntripcasterSchema, sourcetableSchema } from "@/schema/ntripcaster";
import { responseSchema } from "@/schema/response";

const prisma = new PrismaClient();

type Variables = {
  uid: string;
  groupIds: {
    userId: string;
    groupId: number;
    role: string;
  }[];
};

type Sourcetable = z.infer<typeof sourcetableSchema>;

const routes = {
  getNtripcasters: createRoute({
    method: "get",
    path: "/",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(ntripcasterSchema),
          },
        },
        description: "Ntripcasters",
      },
      500: {
        content: {
          "application/json": {
            schema: z.object({ message: z.string() }),
          },
        },
        description: "Internal server error",
      },
    },
  }),
  registerNtripcaster: createRoute({
    method: "post",
    path: "/",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: ntripcasterSchema.omit({
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
            schema: ntripcasterSchema,
          },
        },
        description: "Ntripcaster created",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
    },
  }),
  getMountpoints: createRoute({
    method: "get",
    path: "/mountpoints",
    request: {
      query: z.object({
        host: ntripcasterSchema.shape.host.openapi({
          example: "ntrip-dev.suyama.ne.jp",
        }),
        port: z
          .string()
          .regex(/^\d+$/)
          .transform(Number)
          .refine((val) => val > 0 && val < 65536)
          .openapi({
            example: "2101",
          }),
      }),
    },
    security: [{ Bearer: [] }],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: sourcetableSchema.array(),
          },
        },
        description: "Mountpoints",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
    },
  }),
  getNtripcaster: createRoute({
    method: "get",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: ntripcasterSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ntripcasterSchema,
          },
        },
        description: "Ntripcaster",
      },
      404: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Ntripcaster not found",
      },
      500: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
  patchNtripcaster: createRoute({
    method: "patch",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: ntripcasterSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: ntripcasterSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
              })
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
            schema: ntripcasterSchema,
          },
        },
        description: "Ntripcaster updated",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
    },
  }),
  deleteNtripcaster: createRoute({
    method: "delete",
    path: "/{id}",
    security: [{ Bearer: [] }],
    request: {
      params: ntripcasterSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Ntripcaster deleted",
      },
      400: {
        content: {
          "application/json": {
            schema: responseSchema,
          },
        },
        description: "Bad request",
      },
    },
  }),
};

const ntripcasters = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(routes.getNtripcasters, async (c) => {
    try {
      const groupIds = c.get("groupIds");
      const ntripcasters = await prisma.ntripcaster.findMany({
        where: { groupId: { in: groupIds.map((g) => g.groupId) } },
      });

      return c.json(ntripcasters, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  .openapi(routes.registerNtripcaster, async (c) => {
    const data = c.req.valid("json");
    try {
      const groupIds = c.get("groupIds");
      if (!groupIds.map((g) => g.groupId).includes(data.groupId)) {
        throw new HTTPException(403, { message: "Forbidden" });
      }
      const ntripcaster = await prisma.ntripcaster.create({
        data: data,
      });
      return c.json(ntripcaster, 201);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to create ntripcaster" }, 400);
    }
  })
  .openapi(routes.getMountpoints, async (c) => {
    const data = c.req.valid("query");

    try {
      const res = await fetch(`http://${data.host}:${data.port}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) {
        return c.json({ message: "Failed to fetch mountpoints" }, 400);
      }
      const text = await res.text();
      const sourcetable: Sourcetable[] = text
        .split("\n")
        .filter((line) => line.split(";")[0] === "STR")
        .map((line) => {
          const parts = line.split(";");
          return {
            type: parts[0],
            mountpoint: parts[1],
            identifier: parts[2],
            format: parts[3],
            formatDetails: parts[4],
            carrier: parseInt(parts[5]) as 0 | 1 | 2,
            navSystem: parts[6],
            network: parts[7],
            country: parts[8],
            latitude: parseFloat(parts[9]),
            longitude: parseFloat(parts[10]),
            nmea: Boolean(parts[11]),
            solution: Boolean(parts[12]),
            generator: parts[13],
            comprEncryp: parts[14],
            authentication: parts[15] as "N" | "B" | "D",
            fee: parts[16] as "N" | "Y",
            bitrate: parseInt(parts[17]),
            misc: parts[18].replace("\r", ""),
          };
        });
      // TODO: validate sourcetable
      return c.json(sourcetable, 200);
    } catch (e) {
      if (String(e).indexOf("Malformed_HTTP_Response") !== -1) {
        // HTTP 0.9 response
        try {
          const res =
            await $`curl -s http://${data.host}:${data.port} --http0.9 -m 2`;
          const sourcetable: Sourcetable[] = res
            .text()
            .split("\n")
            .filter((line) => line.split(";")[0] === "STR")
            .map((line) => {
              const parts = line.split(";");
              return {
                type: parts[0],
                mountpoint: parts[1],
                identifier: parts[2],
                format: parts[3],
                formatDetails: parts[4],
                carrier: parseInt(parts[5]) as 0 | 1 | 2,
                navSystem: parts[6],
                network: parts[7],
                country: parts[8],
                latitude: parseFloat(parts[9]),
                longitude: parseFloat(parts[10]),
                nmea: Boolean(parts[11]),
                solution: Boolean(parts[12]),
                generator: parts[13],
                comprEncryp: parts[14],
                authentication: parts[15] as "N" | "B" | "D",
                fee: parts[16] as "N" | "Y",
                bitrate: parseInt(parts[17]),
                misc: parts[18].replace("\r", ""),
              };
            });
          return c.json(sourcetable, 200);
        } catch (e) {
          console.error(e);
          return c.json(
            { message: "Failed to fetch mountpoints by curl" },
            400,
          );
        }
      } else {
        console.error(e);
        return c.json({ message: "Failed to fetch mountpoints" }, 400);
      }
    }
  })
  .openapi(routes.getNtripcaster, async (c) => {
    try {
      const groupIds = c.get("groupIds");
      const ntripcasterId = Number(c.req.param("id"));
      const ntripcaster = await prisma.ntripcaster.findFirst({
        where: {
          id: ntripcasterId,
          groupId: { in: groupIds.map((g) => g.groupId) },
        },
      });
      if (!ntripcaster) {
        return c.json({ message: "Ntripcaster not found" }, 404);
      }
      return c.json(ntripcaster, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Something went wrong" }, 500);
    }
  })
  .openapi(routes.patchNtripcaster, async (c) => {
    const data = c.req.valid("json");
    try {
      const groupIds = c.get("groupIds");
      const ntripcasterId = Number(c.req.param("id"));
      const ntripcaster = await prisma.ntripcaster.update({
        where: {
          id: ntripcasterId,
          groupId: { in: groupIds.map((g) => g.groupId) },
        },
        data: data,
      });
      return c.json(ntripcaster, 200);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to update ntripcaster" }, 400);
    }
  })
  .openapi(routes.deleteNtripcaster, async (c) => {
    try {
      const groupIds = c.get("groupIds");
      const ntripcasterId = Number(c.req.param("id"));
      await prisma.ntripcaster.delete({
        where: {
          id: ntripcasterId,
          groupId: { in: groupIds.map((g) => g.groupId) },
        },
      });
      return c.json({ message: "Ntripcaster deleted" });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Failed to delete ntripcaster" }, 400);
    }
  });
export default ntripcasters;
