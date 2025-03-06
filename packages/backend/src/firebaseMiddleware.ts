import { PrismaClient } from "@prisma/client";
import { getAuth } from "firebase-admin/auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as jwt from "jsonwebtoken";

import { firebase } from "./index";

const prisma = new PrismaClient();

export type Variables = {
  uid: string;
  groupIds: {
    userId: string;
    groupId: number;
    role: string;
  }[];
};

export const firebaseMiddleware = createMiddleware(async (c, next) => {
  console.debug(`[${c.req.method}] ${c.req.url}`);
  console.log("req text ------------- ");
  console.log(await c.req.text());
  console.log("req text ------------- ");

  const authHeader = c.req.raw.headers.get("authorization");
  const idToken = authHeader?.split("Bearer ")[1];
  // console.debug(`[firebaseMiddleware] idToken sent by client: ${idToken}`);

  if (!idToken) {
    console.error("No idToken");
    return c.json({ message: "Please provide an idToken" }, 401);
  }
  try {
    let uid: string | undefined = undefined;
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      // TODO: 本番環境では使わない
      const decodedToken = jwt.decode(idToken, { complete: true });
      if (!decodedToken) {
        throw new Error("トークンのデコードに失敗しました。");
      }
      const payload = decodedToken?.payload as jwt.JwtPayload;
      uid = payload?.user_id;
    } else {
      const decodedToken = await getAuth(firebase).verifyIdToken(idToken);
      uid = decodedToken.uid;
    }
    const groupUserRole = await prisma.groupUserRole.findMany({
      where: { userId: uid },
    });
    c.set("groupIds", groupUserRole);
    c.set("uid", uid);
    // console.debug(`[firebaseMiddleware] passed! uid: ${uid}`);
  } catch (error) {
    console.error(`[firebaseMiddleware] ${error}`);
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
});
