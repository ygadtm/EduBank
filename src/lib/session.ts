import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
  type SessionRole,
} from "./jwt";

const MAX_AGE = 60 * 60 * 24 * 7;

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: {
  id: string;
  role: SessionRole;
}) {
  const token = await signSessionToken(user);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
