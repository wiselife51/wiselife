# Constitución del proyecto WiseLife

**Versión:** 1.0.0
**Fecha:** 2026-08-07
**Estado:** Propuesta; requiere validación de los responsables de dominio
**Responsable:** Documentador Técnico

> Este documento consolida la documentación oficial existente. No sustituye decisiones pendientes ni convierte propuestas en decisiones aprobadas.

## 1. Propósito del documento

`PROJECT_CONSTITUTION.md` es la referencia normativa de mayor autoridad documental de WiseLife. Define principios, estándares y límites para producto, arquitectura, desarrollo, UX/UI, datos, seguridad, IA, QA, DevOps y documentación. Cuando una regla no esté confirmada, se conserva como `[DECISIÓN PENDIENTE]` y se escala al responsable indicado.

## 2. Visión de WiseLife

WiseLife es una plataforma colombiana de atención psicológica que conecta pacientes con psicólogos, facilitando descubrimiento, disponibilidad, reserva, reporte de pago y operación clínica autorizada, con privacidad y seguridad como condiciones del producto.

## 3. Misión

Permitir que pacientes encuentren y reserven atención psicológica, y que los profesionales gestionen disponibilidad, agenda y documentación clínica autorizada dentro de una experiencia accesible, clara y protegida.

## 4. Objetivos estratégicos

- Entregar el MVP de identidad, perfiles, descubrimiento, agenda, pagos reportados y operación clínica.
- Proteger información personal y clínica mediante sesión confiable, mínimo privilegio, RLS, consentimiento y auditoría.
- Mantener una base modular, mantenible y escalable para la evolución comercial.
- Validar cada entrega con criterios funcionales, negativos, de seguridad, accesibilidad, responsive y rendimiento.
- Mantener trazabilidad entre requisito, código, pruebas, documentación, PR, commit y deployment.

## 5. Alcance

### Dentro del proyecto
Autenticación y acceso, onboarding de pacientes y profesionales, perfiles, catálogo y disponibilidad de especialistas, reserva y cancelación, reporte y operación de pagos, citas, agenda profesional, historia clínica, notas, diagnósticos, consentimientos, RLS, auditoría, notificaciones y administración según prioridad del backlog.

### Fuera del alcance actual
Videollamadas propias, chat clínico en tiempo real, aplicación nativa, diagnóstico o recomendaciones clínicas mediante IA, suscripciones, cuentas familiares e integraciones empresariales.

### Futuras versiones
Filtros avanzados, reprogramación, diario emocional, CIE-10, notificaciones, auditoría ampliada, administración, cache, observabilidad, evaluación IA y automatizaciones seguras, siempre sujetas a validación.

## 6. Principios del producto

- Privacidad visible y minimización de datos.
- Lenguaje claro, accesible y no diagnóstico por automatización.
- Decisiones reversibles cuando sea posible.
- Estados completos: carga, vacío, error y éxito.
- Aislamiento por usuario, rol y relación profesional-paciente.
- La seguridad, el consentimiento y la trazabilidad son requisitos del producto, no tareas posteriores.

## 7. Principios de arquitectura

La arquitectura debe favorecer modularidad, escalabilidad, mantenibilidad, reutilización, separación de responsabilidades y rendimiento. El flujo objetivo es `UI → hook → caso de uso → repository → Supabase → RLS → mapper → estado UI`. Se promueven feature slices, componentes presentacionales, facade de Auth, casos de uso, repositories/adapters, validación en bordes, cache centralizada y errores tipados. La extracción prioritaria documentada es citas e historia clínica, seguida de onboarding y especialistas.

## 8. Stack tecnológico oficial

| Tecnología | Propósito | Responsable |
|---|---|---|
| React 19 | Interfaz SPA | Desarrollador Frontend |
| TypeScript | Tipado del cliente | Desarrollador Frontend |
| Vite 7 | Build y desarrollo SPA | Desarrollador Frontend + DevOps |
| React Router | Rutas de aplicación | Desarrollador Frontend |
| i18next | Internacionalización | Frontend + UX/UI |
| Supabase Auth | Identidad y sesiones | Backend + Seguridad |
| Supabase PostgreSQL | Persistencia relacional | Arquitecto de Base de Datos |
| Supabase RLS | Autorización por fila | Seguridad + Base de Datos |
| Supabase Storage | Archivos privados cuando aplique | Base de Datos + Seguridad |
| Vercel | Preview y Production | DevOps |
| GitHub | Código, PR e historial | DevOps |

No se consideran aprobadas tecnologías adicionales no documentadas.

## 9. Principios de desarrollo

El código debe ser limpio, tipado y reutilizable; las páginas coordinan y los componentes reciben props. La lógica de Supabase debe permanecer en hooks, casos de uso o repositories, nunca en componentes visuales sin necesidad. Deben validarse entradas, ownership, estados y concurrencia en servidor/RLS; los errores deben ser tipados y seguros. Toda entrega requiere revisión, pruebas, documentación y trazabilidad. No se confía en IDs, roles ni montos enviados por el cliente.

## 10. Principios UX/UI

Se aplica mobile-first, WCAG 2.2 AA, teclado, foco visible, contraste, zoom 200%, lector de pantalla, touch targets de 44 px y `prefers-reduced-motion`, validando 320, 375, 768, 1024 y 1440 px. Toda pantalla debe cubrir carga, vacío, error y éxito; los formularios requieren labels, ayuda y errores asociados. Acciones clínicas y de pago requieren confirmación y feedback seguro. Los componentes compartidos usan tokens y no duplican estilos ni autorización.

Las rutas públicas deben tener title, description, canonical, Open Graph y datos estructurados verificables en `es-CO`. Login, callback, recuperación, onboarding, dashboards, citas y perfiles privados no se indexan ni aparecen en sitemap. No se envía PII/PHI a analytics, Schema.org, mapas de calor ni previews.

## 11. Principios de seguridad

Supabase Auth, sesiones seguras, RLS en toda tabla expuesta, mínimo privilegio, validación de entradas, secretos sólo server-side, HTTPS, headers y separación de ambientes son obligatorios. La autorización usa sesión, rol confiable y relación profesional-paciente. Deben probarse accesos permitidos y denegados, BOLA/IDOR, reasignación de propietario y acceso a historias ajenas.

Nunca se expone `service_role`, ni se envía PHI a logs, analytics o modelos sin propósito y consentimiento. Las funciones `SECURITY DEFINER` fijan `search_path`; Storage privado, advisors, grants, secret scanning, dependencias y respuesta a incidentes deben revisarse.

## 12. Principios de Inteligencia Artificial

La IA documentada es propuesta y no existe funcionalidad clínica implementada. La IA no autoriza, persiste ni decide clínicamente. Backend valida identidad, consentimiento, política, contexto permitido y herramientas; el modelo trata texto recuperado como no confiable.

El flujo seguro es autenticar, clasificar sensibilidad/riesgo, permitir/limitar/escalar, recuperar contexto con ACL, ejecutar, validar salida/acciones y registrar versión, latencia, costo y fuentes resumidas. La conversación es temporal; preferencias requieren consentimiento; memoria clínica nunca es implícita. Diagnóstico, recomendación clínica autónoma y automatizaciones que modifiquen expedientes sin revisión humana están fuera de alcance.

## 13. Gestión de datos

El sistema usa PostgreSQL administrado por Supabase. Las tablas expuestas requieren RLS con `USING` y `WITH CHECK`; los propietarios derivan de `auth.uid()` y los hijos validan la relación con su padre. Catálogos pueden ser legibles por autenticados; ledger y auditoría no son mutables por usuarios comunes.

Las FK restrictivas protegen evidencia clínica, la cascada se limita a datos derivados, e índices cubren usuario, profesional, estado y fecha. Disponibilidad y movimientos de saldo deben ser atómicos e idempotentes. Las entidades IA descritas son candidatas, no migraciones aplicadas. No se asume que una migración fue ejecutada sin comparar esquema vivo, restricciones, índices y políticas.

## 14. Control de versiones

El flujo oficial es `feature/fix/chore → PR → checks → revisión → main → Vercel Production`; cada PR genera Preview y no se hace push directo a `main`. Las ramas descriptivas parten de `main`, los commits son trazables y el PR incluye riesgos, evidencia y rollback. El merge ocurre tras revisión y checks; Production sólo procede después del merge aprobado. Releases y deployments deben conservar PR, commit y deployment relacionados.

No se introduce un Git Flow alternativo mientras esté pendiente la confirmación de protección de ramas, CODEOWNERS, workflow, versión Node y lockfile por DevOps.

## 15. Ambientes

Los ambientes documentados son local/preview para smoke, Supabase para integración, staging aislado para seguridad/carga y Vercel Production desde `main`. Las variables se separan en Development, Preview y Production; no se versionan secretos y `VITE_*` sólo contiene valores públicos.

## 16. Calidad

QA cubre navegación pública, auth, onboarding, especialistas, disponibilidad, reserva/pago, citas, dashboard profesional, notas e historia clínica. Deben validarse happy path, vacío, error, reintento, refresh, RLS, BOLA/IDOR, roles, XSS, open redirects, integración Auth↔Supabase, concurrencia, idempotencia, accesibilidad, responsive y rendimiento.

Los objetivos iniciales son LCP ≤2.5 s, CLS ≤0.1 e INP ≤200 ms. No puede quedar P0/P1 abierto; un P2 requiere aceptación explícita. Toda incidencia contiene pasos, evidencia, severidad, responsable y retest.

## 17. Definition of Done

Una funcionalidad sólo está terminada cuando:

- Cumple alcance y criterios de aceptación aprobados.
- Tiene validación de entradas, ownership, permisos, estados y errores seguros.
- Incluye pruebas funcionales, negativas, integración, accesibilidad y responsive según impacto.
- Supera revisión de seguridad para datos, RLS, secretos, logs y privacidad.
- Respeta UX/UI, componentes compartidos, responsive y SEO de rutas públicas cuando aplique.
- Actualiza los documentos de arquitectura, API, datos, seguridad, componentes, QA, manual y changelog según impacto.
- Tiene PR, revisión, checks, evidencia, rollback y trazabilidad a commit/deployment.
- No deja P0/P1 abierto y registra explícitamente cualquier P2 aceptado.

## 18. Documentación

`/docs` es la fuente oficial de documentación del proyecto. Cada responsable mantiene actualizado su documento de dominio; el Documentador Técnico conserva consistencia, changelog y trazabilidad. Los chats de IA no son fuente oficial de decisiones.

## 19. Gestión de cambios

Los cambios de arquitectura requieren revisión del Arquitecto de Software; los de datos, del Arquitecto de Base de Datos; los de seguridad, del Arquitecto de Seguridad; los de UX/UI, del Arquitecto UX/UI; los de API, del responsable Backend; los de infraestructura, de DevOps; y los de IA, del Ingeniero de IA junto con Seguridad y Legal cuando corresponda. Todo cambio importante se registra en documentación y changelog antes de considerarse cerrado.

## 20. Resolución de conflictos

Ante contradicciones, no se elige arbitrariamente ni se modifica el documento de otro responsable. Se conserva `[DECISIÓN PENDIENTE]`, se identifican documentos y responsables afectados, y se solicita resolución al dueño del dominio con participación del Documentador Técnico. Mientras no exista validación, se aplica la alternativa más segura y reversible sólo si ya está respaldada por documentación; de lo contrario, se bloquea el cambio.

## 21. Principios para agentes de IA

Los agentes deben leer documentación relevante antes de actuar, respetar responsabilidades, no inventar información ni requisitos, no modificar decisiones ajenas sin autorización, documentar cambios, informar riesgos e incertidumbres, mantener trazabilidad y proteger información sensible. Deben distinguir estado actual, propuesta y pendiente, y escalar decisiones que excedan su mandato.

## 22. Escalabilidad

La evolución comercial debe preservar módulos independientes, contratos claros, repositories/adapters, RLS, observabilidad segura, cache centralizada cuando esté validada, idempotencia, índices adecuados y pruebas de concurrencia. No se escala introduciendo tecnologías o persistencias no aprobadas; toda evolución se valida contra rendimiento, costo, privacidad, mantenibilidad y operación.

## 23. Excepciones

Una excepción debe documentar regla afectada, motivo, riesgo, alcance, duración, mitigaciones, evidencia y responsable aprobador. Las excepciones de seguridad, datos clínicos, producción, arquitectura, costos relevantes o cumplimiento requieren aprobación humana del responsable de dominio y, cuando aplique, Legal. La excepción no se considera precedente hasta actualizar la documentación oficial.

## 24. Control de versiones del documento

| Versión | Fecha | Estado | Responsable | Cambio |
|---|---|---|---|---|
| 1.0.0 | 2026-08-07 | Propuesta; requiere validación | Documentador Técnico | Primera consolidación normativa basada en la documentación oficial |

### Decisiones pendientes consolidadas

- Rama y commit canónicos, workflow, protección de ramas, CODEOWNERS y versión Node — **DevOps + Arquitecto de Software**.
- Esquema/RLS vivo, migración legacy, retención clínica, Storage e índices productivos — **Base de Datos + Seguridad + Legal**.
- Roles administrativos, clasificación formal, DPIA, rate limits y calendario de auditoría — **Seguridad + Legal**.
- Política de pagos, cancelación, notificaciones, fechas y métricas de éxito — **Product Owner + Finanzas/Legal**.
- Proveedor, modelos, presupuesto, evaluación, retención y escalamiento de IA — **Ingeniero de IA + Seguridad + Legal**.
- Herramientas, cobertura, staging, datos sintéticos y pruebas de carga — **QA + DevOps**.
- Tokens, copy legal, indexación de perfiles y pruebas con usuarios — **UX/UI + Product Owner + Legal**.
- Contrato HTTP, rutas, OpenAPI, versionado, límites, webhooks y autenticación server-side — **Backend + Seguridad**.

## Fuentes utilizadas

`PRODUCT_BACKLOG.md`, `ROADMAP.md`, `SPRINT_01.md`, `ARQUITECTURA.md`, `BASE_DATOS.md`, `UX_GUIDE.md`, `API.md`, `SEGURIDAD.md`, `IA.md`, `DEVOPS.md`, `PLAN_PRUEBAS.md`, `COMPONENTES.md`, `CHANGELOG.md` y `MANUAL_DESARROLLADOR.md`.

No se modificaron los documentos fuente ni se alteró código o funcionalidad.

## Estado de validación

**[DECISIÓN PENDIENTE]** La Constitución requiere revisión de Product Owner, Scrum Master, Arquitecto de Software, Arquitecto de Base de Datos, Arquitecto UX/UI, Seguridad, Ingeniero de IA, QA, DevOps y responsables legales antes de ser normativa definitiva.

---

*WiseLife — Constitución del proyecto*
