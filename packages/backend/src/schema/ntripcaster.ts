import { z } from "@hono/zod-openapi";

const hostnameSchema = z
  .string()
  .regex(
    // domain
    /^(?!-)(?!.*--)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*$/,
  )
  // domain (punycode)
  .or(z.string().regex(/^xn--[a-zA-Z0-9-]{1,63}\.[a-zA-Z]{2,}$/))
  // ipv4
  .or(
    z
      .string()
      .regex(
        /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
      ),
  )
  // ipv6
  .or(
    z
      .string()
      .regex(
        /((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
      ),
  );

export const ntripcasterSchema = z
  .object({
    id: z.coerce.number().openapi({
      example: 1,
      param: {
        name: "id",
        in: "path",
      },
    }),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    groupId: z.number().int().positive().openapi({
      example: 1,
    }),
    name: z.string().min(1).max(30).openapi({
      example: "ntripcaster",
    }),
    mountpoint: z.string().max(30).openapi({
      example: "mountpoint",
    }),
    host: z.string().min(1).max(100).and(hostnameSchema).openapi({
      example: "ntrip.suyama.ne.jp",
    }),
    port: z.number().int().positive().max(65535).openapi({
      example: 2101,
    }),
    username: z.string().max(30).nullable().optional(),
    password: z.string().max(30).nullable().optional(),
  })
  .openapi("Ntripcaster");

export const sourcetableSchema = z.object({
  type: z.string(),
  mountpoint: z.string(),
  identifier: z.string(),
  format: z.string(),
  formatDetails: z.string(),
  carrier: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  navSystem: z.string(),
  network: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  nmea: z.boolean(),
  solution: z.boolean(),
  generator: z.string(),
  comprEncryp: z.string(),
  authentication: z.enum(["N", "B", "D"]),
  fee: z.enum(["N", "Y"]),
  bitrate: z.number().int(),
  misc: z.string(),
});
