// eslint-disable-next-line @typescript-eslint/no-require-imports
import { hc } from "hono/client";

import { routes } from ".";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = hc<typeof routes>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof routes>(...args);
