# Diagramas oficiales

Los diagramas representan el estado documentado; no sustituyen el código ni la verificación del esquema vivo.

## Contexto

```mermaid
flowchart LR
  Paciente --> WiseLife
  Psicologo[Psicólogo] --> WiseLife
  WiseLife --> Supabase[Supabase Auth y Postgres]
  WiseLife --> Vercel[Vercel SPA]
```

## Módulos

```mermaid
flowchart TB
  App[React App]
  App --> Auth[Identidad]
  App --> Patient[Experiencia paciente]
  App --> Agenda[Agenda]
  App --> Professional[Experiencia profesional]
  Professional --> Clinical[Historia clínica]
  Auth --> Supabase[Supabase]
  Patient --> Supabase
  Agenda --> Supabase
  Clinical --> Supabase
```

## Flujo de datos

```mermaid
sequenceDiagram
  participant U as Usuario
  participant P as Página/Componente
  participant C as Cliente Supabase
  participant A as Auth/RLS
  participant D as Postgres
  U->>P: Acción o formulario
  P->>C: Solicitud validada
  C->>A: Sesión y política
  A->>D: Consulta autorizada
  D-->>P: Resultado o error seguro
  P-->>U: Estado visual
```

## Despliegue

```mermaid
gitGraph
  commit id: "feature"
  branch preview
  checkout main
  commit id: "PR aprobado"
  commit id: "Vercel producción"
```

## Modelo clínico simplificado

```mermaid
erDiagram
  PROFILES ||--o{ CLINICAL_RECORDS : patient
  PSYCHOLOGISTS ||--o{ CLINICAL_RECORDS : creates
  CLINICAL_RECORDS ||--o{ SESSION_NOTES : contains
  APPOINTMENTS ||--o| SESSION_NOTES : records
  SESSION_NOTES }o--|| CIE10_CODES : diagnoses
```

El modelo completo, columnas, índices, triggers y políticas están en `supabase/migrations/20260807000100_wiselife_data_architecture.sql` y en el script histórico de `database/`. Debe verificarse antes de usarlo como contrato productivo.
