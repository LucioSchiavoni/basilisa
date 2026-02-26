# LISA 2.0 — Plataforma Terapéutica Gamificada

Plataforma web para niños y adultos con dislexia y TDAH en Uruguay. Conecta pacientes con expertos (psicopedagogos) a través de ejercicios terapéuticos gamificados con mundos temáticos, personajes animados y sistema de recompensas con gemas.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth con Google OAuth, Database, RLS, Storage)
- Shadcn UI
- GSAP (animaciones y scroll-triggered effects)
- React Hook Form + Zod (formularios)
- pnpm
- Deploy: Vercel

## Reglas

- Edits quirúrgicos: modificar solo lo necesario, nunca reescribir archivos completos
- No incluir comentarios en el código
- UI en español, código/database/variables en inglés
- Server Components por defecto, Client Components solo cuando sea necesario
- Seguir patrones existentes del codebase
- Soft delete con deleted_at en lugar de borrado físico
- Usar adminClient (service_role) solo en server-side para operaciones privilegiadas
- Validar inputs con Zod, nunca exponer claves sensibles en el cliente

## Arquitectura

```
src/
├── app/
│   ├── (auth)/login/                    # Login (Google OAuth + email/password)
│   ├── (protected)/                     # Requiere sesión (middleware)
│   │   ├── admin/                       # Panel admin/experta (role=admin)
│   │   │   ├── ejercicios/
│   │   │   │   ├── crear/               # Formulario creación con editores dinámicos por tipo
│   │   │   │   │   ├── general-data-section.tsx
│   │   │   │   │   ├── multiple-choice-editor.tsx
│   │   │   │   │   ├── reading-comprehension-editor.tsx
│   │   │   │   │   └── timed-reading-editor.tsx
│   │   │   │   └── [id]/               # Edición ejercicio (edit-exercise-form.tsx)
│   │   │   └── usuarios/               # Gestión usuarios y cambio de roles
│   │   ├── ejercicios/                  # Vista paciente (role=patient)
│   │   │   ├── (browse)/page.tsx        # Exploración por mundos + ejercicios asignados
│   │   │   └── [id]/                    # Player de ejercicio (exercise-player.tsx)
│   │   └── dashboard/
│   ├── api/auth/callback/               # OAuth callback con exchangeCodeForSession
│   └── page.tsx                         # Landing page (animaciones GSAP, logo LISA)
├── components/
│   ├── ui/                              # Shadcn UI
│   └── landing/                         # floating-elements, hero-buttons, mascot, xp-badge
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # createClient → Client Components (respeta RLS)
│   │   ├── server.ts                    # createClient → Server Components (respeta RLS)
│   │   └── admin.ts                     # adminClient con SERVICE_ROLE_KEY (solo server)
│   └── utils.ts
├── hooks/
└── types/
    └── database.types.ts                # Tipos generados de Supabase
```

## Autenticación y Roles

- Google OAuth + email/password via Supabase Auth SSR (@supabase/ssr)
- Trigger on_auth_user_created inserta en profiles con role='patient' por defecto
- Dos roles activos: patient (paciente) y admin (experta/terapeuta)
- CHECK constraint permite: patient, expert, admin — solo se usan patient y admin
- Middleware valida sesión con getUser() y protege /(protected)/
- Admin cambia roles desde panel usuarios con adminClient
- Nunca usar getSession() para validar auth en server, siempre getUser()

## Base de Datos (Supabase)

MCP de Supabase disponible para consultar detalles en tiempo real.

### profiles
Extiende auth.users. Se crea automáticamente via trigger on_auth_user_created.

| Columna | Tipo | Default | Nota |
|---------|------|---------|------|
| id | uuid PK | FK → auth.users | |
| email | text | | |
| role | text | 'patient' | patient o admin |
| full_name | text | NULL | |
| avatar_url | text | NULL | |
| date_of_birth | date | NULL | |
| phone | text | NULL | |
| is_profile_complete | boolean | false | |
| is_active | boolean | true | |
| created_at, updated_at | timestamptz | now() | |

### exercise_types
Catálogo de tipos. Actuales: multiple_choice, reading_comprehension, timed_reading.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| name | text | Identificador: 'multiple_choice' |
| display_name | text | Visible: 'Opción Múltiple' |
| description | text | Nullable |
| icon | text | Nullable |
| is_active | boolean | Default true |

### exercises
Biblioteca de ejercicios. El campo content (JSONB) varía según exercise_type.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| created_by | uuid FK → profiles | |
| exercise_type_id | uuid FK → exercise_types | |
| title | text | |
| instructions | text | Nullable |
| instructions_audio_url | text | Nullable |
| difficulty_level | integer | Default 1 (rango 1-6, mapea a mundos) |
| estimated_time_seconds | integer | Nullable |
| content | jsonb | Estructura según tipo (ver abajo) |
| tags | text[] | Default '{}' |
| target_age_min, target_age_max | integer | Nullable |
| world_id | text | Nullable |
| is_active | boolean | Default true |
| deleted_at | timestamptz | Nullable (soft delete) |
| created_at, updated_at | timestamptz | |

### Estructura del campo content (JSONB) por tipo

**multiple_choice:**
```json
{
  "shuffle_options": true,
  "shuffle_questions": false,
  "show_feedback": true,
  "questions": [
    {
      "id": "q1",
      "text": "¿Pregunta?",
      "image_url": null,
      "audio_url": null,
      "options": [
        { "id": "a", "text": "Opción", "image_url": null }
      ],
      "correct_option_id": "a",
      "explanation": "Explicación opcional",
      "points": 1
    }
  ]
}
```

**reading_comprehension:**
```json
{
  "reading_text": "Texto para leer...",
  "reading_audio_url": null,
  "word_count": 45,
  "hide_text_during_questions": false,
  "questions": [
    {
      "id": "q1",
      "text": "¿Pregunta sobre el texto?",
      "type": "multiple_choice",
      "options": [{ "id": "a", "text": "Opción" }],
      "correct_option_id": "a",
      "points": 1
    }
  ]
}
```

**timed_reading:**
```json
{
  "reading_text": "Texto para lectura cronometrada...",
  "reading_audio_url": null,
  "word_count": 120,
  "show_timer": true
}
```

### worlds
6 mundos temáticos fantasía medieval. difficulty_level 1-6 define el orden.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| name, slug, description | text | |
| difficulty_level | integer | 1=Medieval, 2=Forest, 3=Water, 4=Fire, 5=Ice, 6=Sky |
| theme | jsonb | background, colors, icon URLs |
| is_active | boolean | |

### world_exercises
Tabla puente ejercicios ↔ mundos con orden.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| world_id | uuid FK → worlds | |
| exercise_id | uuid FK → exercises | |
| position | integer | Orden dentro del mundo |

### patient_assignments
Ejercicios asignados por admin a pacientes.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| patient_id | uuid FK → profiles | |
| assigned_by | uuid FK → profiles | Admin que asigna |
| exercise_id | uuid FK → exercises | |
| status | text | Default 'pending' |
| due_date | timestamptz | Nullable |
| notes_for_patient | text | Nullable |
| assigned_at, started_at, completed_at | timestamptz | |

### assignment_sessions
Cada intento de un ejercicio. Soporta asignados y libres (exploración).

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| assignment_id | uuid FK → patient_assignments | NULL si libre |
| exercise_id | uuid FK → exercises | |
| patient_id | uuid FK → profiles | |
| attempt_number | integer | Default 1 |
| is_completed | boolean | Default false |
| is_assigned | boolean | Default true (false = libre) |
| started_at, ended_at | timestamptz | |
| duration_seconds | integer | |

### assignment_results
Respuesta individual por pregunta dentro de una sesión.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| session_id | uuid FK → assignment_sessions | |
| assignment_id | uuid FK → patient_assignments | Nullable |
| patient_id | uuid FK → profiles | |
| question_id | text | ID de la pregunta en content JSONB |
| patient_answer | jsonb | {"selected": "option_id"} |
| correct_answer | jsonb | {"correct": "option_id"} |
| is_correct | boolean | |
| time_spent_seconds | integer | Nullable |
| answered_at | timestamptz | |

### assignment_scores
Resumen de sesión completa.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| session_id | uuid FK → assignment_sessions | |
| assignment_id | uuid FK → patient_assignments | Nullable |
| patient_id | uuid FK → profiles | |
| total_questions | integer | |
| correct_answers | integer | |
| incorrect_answers | integer | |
| score_percentage | numeric | |
| total_time_seconds | integer | |

### user_gems
Balance de gemas por usuario. UNIQUE(user_id).

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| user_id | uuid FK → profiles | UNIQUE |
| total_gems | integer | |
| current_streak, best_streak | integer | |
| last_activity_date | date | |

### gem_transactions
Historial de gemas.

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| amount | integer | |
| transaction_type | text | earned/spent/bonus |
| source | text | exercise_completion/streak/perfect_score |
| session_id | uuid FK → assignment_sessions | Nullable |
| metadata | jsonb | Nullable |

### storage_files
Registro de archivos subidos (audio/imágenes de ejercicios).

| Columna | Tipo | Nota |
|---------|------|------|
| id | uuid PK | |
| user_id | uuid FK | |
| exercise_id | uuid FK → exercises | Nullable |
| bucket_id, file_path | text | |
| file_size | bigint | |
| mime_type, file_type | text | |

### Relaciones clave (FK)

```
profiles ← exercises.created_by
profiles ← patient_assignments.patient_id, .assigned_by
profiles ← assignment_sessions.patient_id
profiles ← assignment_results.patient_id
profiles ← assignment_scores.patient_id
profiles ← user_gems.user_id
profiles ← gem_transactions.user_id

exercises ← patient_assignments.exercise_id
exercises ← assignment_sessions.exercise_id
exercises ← world_exercises.exercise_id
exercises ← storage_files.exercise_id
exercise_types ← exercises.exercise_type_id

patient_assignments ← assignment_sessions.assignment_id
patient_assignments ← assignment_results.assignment_id
patient_assignments ← assignment_scores.assignment_id

assignment_sessions ← assignment_results.session_id
assignment_sessions ← assignment_scores.session_id
assignment_sessions ← gem_transactions.session_id

worlds ← world_exercises.world_id
```

### RLS — Patrón general

- Patients: ven/editan solo su propia data (auth.uid() = user_id/patient_id/player_id)
- Admins: ALL en todas las tablas (profiles.role = 'admin')
- Gems (user_gems, gem_transactions): escritura solo via service_role (adminClient)
- Exercises: patients ven activos con deleted_at IS NULL
- Worlds/world_exercises: autenticados leen activos
- storage_files: users ven sus propios archivos, admins insertan y borran
- Función auxiliar get_user_role() usada en policies de exercises y profiles

## Flujo de Ejercicios

### Flujo completo del paciente
1. Paciente entra a exploración por mundos o ve ejercicios asignados
2. Selecciona ejercicio → exercise-player.tsx carga content JSONB
3. Fase intro (instrucciones + audio opcional)
4. Fase reading (solo reading_comprehension: texto con opción de ocultar)
5. Fase questions (responde una por una)
6. Al completar → assignment_session + assignment_results + assignment_scores
7. Se calculan y otorgan gemas via adminClient

### Sistema de gemas
- 10 base por completar
- +5 por 100% correcto
- +3 por primer intento
- Streaks: +15 (3 días), +50 (7 días), +100 (14 días), +300 (30 días)

### Progresión de mundos
- Todos los mundos accesibles libremente
- Ejercicios en orden por position en world_exercises
- Progreso calculado en tiempo real desde assignment_sessions (is_completed = true)

## Assets Visuales

- Mundos y personajes: estáticos en /public/ (no cambian)
- Uploads de admin (audio/imágenes): Supabase Storage → storage_files
- 6 mundos con personaje propio que aparece durante ejercicios
- Estética: watercolor/escandinavo 
