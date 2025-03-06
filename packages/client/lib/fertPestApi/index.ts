import { hc } from "hono/client";

import { AppType } from "./temp";

export const fertPestApiClient = hc<AppType>(
  process.env.EXPO_PUBLIC_PESTICIDE_FERTILIZER_API_URL ||
    "https://wicon2024-pesticide-fertilizer-api.polished-cell-2144.workers.dev/",
);
