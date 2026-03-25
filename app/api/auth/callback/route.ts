import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, requestUrl.origin));
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

  const nextParam = requestUrl.searchParams.get("next");
  const safeNext = nextParam && /^\/[a-zA-Z0-9\-_/]*$/.test(nextParam) ? nextParam : null;
  const gradeYearParam = requestUrl.searchParams.get("grade_year");
  const gradeYearNum = gradeYearParam ? Number(gradeYearParam) : null;
  const gradeYear = gradeYearNum && Number.isInteger(gradeYearNum) && gradeYearNum >= 1 && gradeYearNum <= 6 ? gradeYearNum : null;

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=no_user", requestUrl.origin));
  }

  if (gradeYear) {
    await supabase
      .from("profiles")
      .update({
        grade_year: gradeYear,
        grade_year_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_profile_complete, grade_year, needs_grade_review")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.redirect(new URL("/login?error=profile", requestUrl.origin));
  }

  let redirectPath = safeNext ?? "/ejercicios";

  if (!safeNext) {
    if (profile.role !== "admin" && !profile.grade_year) {
      redirectPath = "/completar-grado";
    } else if (profile.role === "patient" && profile.needs_grade_review) {
      redirectPath = "/confirmar-grado";
    } else if (!profile.is_profile_complete && profile.role !== "patient") {
      redirectPath = "/completar-perfil";
    } else if (profile.role === "admin") {
      redirectPath = "/admin";
    }
  }

  const redirectUrl = new URL(redirectPath, requestUrl.origin);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
