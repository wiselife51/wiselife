# Arquitectura de Inteligencia Artificial de WiseLife

## Propósito
Este directorio define la arquitectura objetivo de IA para WiseLife: agentes, asistentes, RAG, modelos, automatizaciones, integraciones, seguridad y roadmap. Es documentación de arquitectura, no una implementación de negocio.

## Alcance y estado
- **Estado:** propuesta base para revisión del Arquitecto de Software, UX/UI y responsables clínicos.
- **Fuente actual:** SPA React + TypeScript + Vite, Supabase Auth/Postgres/RLS/Storage y dominios de usuarios, bienestar, especialistas, citas, historia clínica, notas, diagnósticos y pagos.
- **Regla:** toda capacidad clínica requiere validación profesional, legal, consentimiento explícito y controles adicionales.
- **Limitación:** el esquema vivo de Supabase debe reconciliarse antes de crear tablas, funciones o políticas; aquí no se aplican migraciones.

## Guía de lectura
1. [Arquitectura](./ARCHITECTURE.md)
2. [Agentes y asistentes](./AGENTS.md)
3. [RAG](./RAG.md)
4. [Modelos](./MODELS.md)
5. [Automatizaciones](./AUTOMATIONS.md)
6. [Integraciones](./INTEGRATIONS.md)
7. [Seguridad y gobernanza](./SECURITY-GOVERNANCE.md)
8. [Roadmap](./ROADMAP.md)
9. [Diagramas](./diagrams.md)

## Principios de decisión
Antes de usar IA: definir el problema, comprobar si reglas deterministas bastan, estimar costo/latencia, clasificar riesgo y definir cómo se probará. La IA debe estar separada de la lógica de negocio, usar prompts versionados, salidas estructuradas, mínimo privilegio y escalamiento humano.

## ADR resumidas
- **ADR-01:** empezar por bienestar y operación no clínica; no diagnóstico ni prescripción.
- **ADR-02:** Supabase/RLS continúa siendo frontera de autorización; el modelo nunca decide permisos.
- **ADR-03:** gateway de modelos agnóstico, con fallback y evaluación por tarea.
- **ADR-04:** RAG separado por nivel de sensibilidad y tenant; nunca mezclar pacientes.
- **ADR-05:** automatizaciones idempotentes, auditables y reversibles.
