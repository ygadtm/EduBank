import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE = "edubank_session";
export type SessionRole = "SISWA" | "GURU";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET belum diisi.");
  return new TextEncoder().encode(value);
}

export async function signSessionToken(user: {
  id: string;
  role: SessionRole;
}) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "SISWA" && payload.role !== "GURU") return null;
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      role: payload.role as SessionRole,
    };
  } catch {
    return null;
  }
}
