# Arquitectura WiseLife

## 1. Estado actual

WiseLife es una SPA React 19 + TypeScript + Vite 7. `src/main.tsx` inicializa la aplicación; `src/App.tsx` compone rutas, layout y proveedores. `AuthContext` centraliza la sesión. `src/lib/supabase.ts` expone el cliente Supabase. `vercel.json` redirige las rutas al `index.html` para soportar navegación SPA.

## 2. Módulos observados

| Módulo | Superficies principales | Sensibilidad |
|---|---|---|
| Marketing | Home y secciones públicas | Baja |
| Identidad | Login, login de psicólogo, callback y contexto | Alta |
| Paciente | Dashboard, perfil, onboarding y encuestas | Alta |
| Descubrimiento | Especialistas y perfil de especialista | Media/alta |
| Agenda | Mis citas y disponibilidad relacionada | Alta |
| Profesional | Onboarding y dashboard de psicólogo | Muy alta |
| Clínico | Historia clínica y notas por sesión | Crítica |

## 3. Estructura vigente

```text
src/
  App.tsx, main.tsx
  context/AuthContext.tsx
  lib/supabase.ts
  components/<componente>/
  pages/<pantalla>/
  types/clinicalHistory.ts
  i18n.ts
supabase/migrations/
database/
public/locales/
```

La arquitectura objetivo por features está descrita en `docs/ARCHITECTURE.md`; no se presenta como una migración ya ejecutada.

## 4. Flujo de datos

```text
Pantalla -> contexto/utilidad -> cliente Supabase -> Auth/Postgres/RLS -> estado visual
```

La implementación actual contiene consultas desde páginas y componentes. La evolución recomendada es extraer adaptadores, validación y casos de uso por dominio, sin cambiar el comportamiento visible.

## 5. Fronteras de seguridad

- La UI no es una frontera de autorización.
- Las tablas expuestas deben usar RLS y políticas por usuario, rol y relación.
- `service_role` y secretos nunca deben llegar al navegador.
- Los datos clínicos no deben aparecer en logs, analytics ni mensajes de error.
- La autorización debe derivarse de la sesión y políticas confiables, no de datos editables por el usuario.

## 6. Datos clínicos

El esquema versionado relevante está en `supabase/migrations/20260807000100_wiselife_data_architecture.sql`; el script histórico está en `database/sprint1_clinical_history_schema.sql`. Antes de afirmar que una tabla o política está activa debe contrastarse el esquema vivo de Supabase. El modelo incluye, entre otros, historia clínica, notas de sesión y catálogo CIE-10.

## 7. Despliegue

GitHub es la fuente de cambios y Vercel construye la SPA. El flujo recomendado es `feature/* -> PR -> checks -> main -> producción`, con previews aislados por PR. La configuración actual usa un rewrite global a `index.html`.

## 8. Deuda y evolución

- Reducir el acoplamiento entre páginas y persistencia.
- Centralizar validación y mapeo de errores.
- Añadir pruebas de autorización/RLS y una CI reproducible.
- Mantener sincronizados el esquema documentado y el esquema vivo.

Para diagramas, consultar [diagramas](./diagramas.md) y para el inventario especializado `../ARCHITECTURE.md`.
