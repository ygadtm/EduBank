import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const { pathname } = request.nextUrl;

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/guru") && session.role !== "GURU") {
    return NextResponse.redirect(new URL("/siswa/beranda", request.url));
  }

  if (pathname.startsWith("/siswa") && session.role !== "SISWA") {
    return NextResponse.redirect(new URL("/guru/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/guru/:path*", "/siswa/:path*", "/ganti-password"],
};
