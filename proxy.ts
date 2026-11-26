import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "@/lib/auth";

/**
 * Checagem otimista: manda para o login quem acessa /admin sem sessão válida.
 * A verificação definitiva acontece em cada página e Server Action (lib/sessao.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const ok = await tokenValido(request.cookies.get(COOKIE_SESSAO)?.value);
  if (!ok) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
