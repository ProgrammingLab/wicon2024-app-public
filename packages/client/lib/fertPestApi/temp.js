/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
const app = new Hono();
const stringSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9ぁ-んァ-ヶー\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf\s　]*$/,
  )
  .min(1);
const limit = 20;
const route = app
  .get(
    "/pesticides",
    zValidator(
      "query",
      z.object({
        query: stringSchema,
      }),
    ),
    async (c) => {
      const { query } = c.req.valid("query");
      try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM pesticide WHERE 登録番号 LIKE ? OR 農薬の種類 LIKE ? OR 農薬の名称 LIKE ? OR 正式名称 LIKE ? OR 有効成分 LIKE ?",
        )
          .bind(
            `${query}%`,
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
          )
          .all();
        return c.json(results);
      } catch (e) {
        console.error(e);
        return c.json({ err: "kora-" }, 500);
      }
    },
  )
  .get(
    "/pesticides/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM pesticide WHERE 登録番号 = ? LIMIT 1",
        )
          .bind(id)
          .all();
        return c.json(results);
      } catch (e) {
        console.error(e);
        return c.json({ err: "kora-" }, 500);
      }
    },
  )
  .get(
    "/pesticides/:id/detail",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      const id = c.req.valid("param");
      try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM pesticide_detail WHERE 登録番号 = ? LIMIT 1",
        )
          .bind(id)
          .all();
        return c.json(results);
      } catch (e) {
        console.error(e);
        return c.json({ err: "kora-" }, 500);
      }
    },
  )
  .get(
    "/fertilizers",
    zValidator(
      "query",
      z.object({
        query: stringSchema,
      }),
    ),
    async (c) => {
      const { query } = c.req.valid("query");
      try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM fertilizer WHERE 登録番号 LIKE ? OR 肥料の名称 LIKE ? OR 肥料種類名称 LIKE ? LIMIT ?",
        )
          .bind(`%${query}%`, `%${query}%`, `%${query}%`, limit)
          .all();
        return c.json(results);
      } catch (e) {
        console.error(e);
        return c.json({ err: "kora-" }, 500);
      }
    },
  )
  .get(
    "/fertilizers/:id",
    zValidator("param", z.object({ id: stringSchema })),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        let { results } = await c.env.DB.prepare(
          "SELECT * FROM fertilizer WHERE 登録番号 = ? LIMIT 1",
        )
          .bind(id)
          .all();
        return c.json(results);
      } catch (e) {
        console.error(e);
        return c.json({ err: "kora-" }, 500);
      }
    },
  );
export default app;
