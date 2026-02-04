# Proyecto basilisa


## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Shadcn UI
-pnpm

## Arquitectura
src/
├── app/
│   ├── (auth)/
│   ├── (protected)/
│   └── api/
├── lib/supabase/
├── components/
├── hooks/
└── types/


## Convenciones de código
- No incluir comentarios
- Validación de formularios con zod
- Usar Server Components por defecto, Client Components solo cuando sea necesario
- Tipos de Supabase en @/types/database.types.ts

## Seguridad
- CSP estricto configurado en next.config.ts
- Middleware protege rutas bajo /(protected)/
- Usar createClient de server.ts en Server Components
- Usar createClient de client.ts en Client Components
- Nunca exponer SUPABASE_SERVICE_ROLE_KEY en el cliente

## Supabase
- Cliente browser: @/lib/supabase/client.ts
- Cliente server: @/lib/supabase/server.ts
- Auth callback: /api/auth/callback

## Autenticación

Usar Supabase Auth con SSR (@supabase/ssr).

### Flujos requeridos
- Login con email/password usando supabase.auth.signInWithPassword()
- Registro con supabase.auth.signUp() y verificación de email
- Logout con supabase.auth.signOut()
- Recovery con supabase.auth.resetPasswordForEmail()
- OAuth callback en /api/auth/callback usando exchangeCodeForSession()

### Protección de rutas
- Middleware valida sesión con supabase.auth.getUser()
- Rutas bajo /(protected)/ requieren sesión activa
- Rutas bajo /(auth)/ redirigen a /dashboard si ya hay sesión

### Manejo de sesión
- Refresh automático en middleware
- Cookies manejadas por @supabase/ssr
- Nunca usar getSession() para validar auth en server, siempre getUser()


# Feature Google OAuth
Implementa el botón de inicio de sesión con Google OAuth en el proyecto.

Contexto:
- Supabase ya está configurado con el provider de Google
- Google Cloud OAuth credentials ya están configuradas
- El proyecto usa Next.js con Supabase

Requisitos:
1. Crear un componente de botón "Continuar con Google" 
2. Usar el método signInWithOAuth de Supabase
3. Configurar el redirect URL apropiado
4. Manejar el callback de autenticación
5. Redirigir al usuario después del login exitoso

La función de Supabase que necesitas usar es:
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

Crea también la ruta /auth/callback que maneje el intercambio del código por la sesión.