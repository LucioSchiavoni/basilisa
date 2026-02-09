import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/patient-login"];
const PROTECTED_ROUTES = ["/dashboard", "/ejercicios", "/pacientes", "/completar-perfil", "/admin", "/change-password"];
const REDIRECT_BY_ROLE_ROUTES = ["/", "/dashboard"];

const ROLE_RESTRICTED_ROUTES: Record<string, string> = {
  "/admin": "admin",
  "/pacientes": "admin",
  "/ejercicios": "patient",
};

function getDefaultPathForRole(role: string | undefined, isProfileComplete: boolean | undefined): string {
  if (!isProfileComplete && role !== "patient") {
    return "/completar-perfil";
  }
  if (role === "admin") return "/admin";

  return "/ejercicios";
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isRedirectByRoleRoute = REDIRECT_BY_ROLE_ROUTES.includes(pathname);

  if (isRedirectByRoleRoute && user) {
    if (user.user_metadata?.must_change_password === true) {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_profile_complete")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = getDefaultPathForRole(profile?.role, profile?.is_profile_complete);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    if (user.user_metadata?.must_change_password === true) {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_profile_complete")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = getDefaultPathForRole(profile?.role, profile?.is_profile_complete);
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && user) {
    const mustChangePassword = user.user_metadata?.must_change_password === true;

    if (mustChangePassword && !pathname.startsWith("/change-password")) {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.redirect(url);
    }

    if (!mustChangePassword && pathname.startsWith("/change-password")) {
      const url = request.nextUrl.clone();
      url.pathname = "/ejercicios";
      return NextResponse.redirect(url);
    }

    const matchedRoute = Object.keys(ROLE_RESTRICTED_ROUTES).find((route) =>
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_profile_complete")
        .eq("id", user.id)
        .single();

      const requiredRole = ROLE_RESTRICTED_ROUTES[matchedRoute];

      if (profile?.role !== requiredRole) {
        const url = request.nextUrl.clone();
        url.pathname = getDefaultPathForRole(profile?.role, profile?.is_profile_complete);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
