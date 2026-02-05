import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin));
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=no_user", requestUrl.origin));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_profile_complete")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.redirect(new URL("/login?error=profile", requestUrl.origin));
  }

  let redirectPath = "/ejercicios";

  if (!profile.is_profile_complete && profile.role !== "patient") {
    redirectPath = "/completar-perfil";
  } else if (profile.role === "admin") {
    redirectPath = "/admin";
  } else if (profile.role === "expert") {
    redirectPath = "/pacientes";
  }

  const redirectUrl = new URL(redirectPath, requestUrl.origin);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
