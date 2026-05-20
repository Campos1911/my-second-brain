import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define quais rotas o middleware deve monitorar
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};

export function middleware(request: NextRequest) {
  // Pega o cookie que configuramos no Zustand/js-cookie
  const token = request.cookies.get("sb_token")?.value;

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Se tentar acessar o Dashboard sem token, redireciona pro Login
  if (isDashboardRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Se tentar acessar a tela de Login/Register já estando logado, manda pro Dashboard
  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Redirecionamento da rota raiz ('/')
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
