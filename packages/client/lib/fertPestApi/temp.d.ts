import { Hono } from "hono";
type Bindings = {
    DB: D1Database;
};
declare const app: Hono<{
    Bindings: Bindings;
}, import("hono/types").BlankSchema, "/">;
declare const route: import("hono/hono-base").HonoBase<{
    Bindings: Bindings;
}, {
    "/pesticides": {
        $get: {
            input: {
                query: {
                    query: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                query: {
                    query: string;
                };
            };
            output: {
                err: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/pesticides/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                err: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/pesticides/:id/detail": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                err: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/fertilizers": {
        $get: {
            input: {
                query: {
                    query: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                query: {
                    query: string;
                };
            };
            output: {
                err: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/fertilizers/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                err: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
}, "/">;
export default app;
export type AppType = typeof route;
