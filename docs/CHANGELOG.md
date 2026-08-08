# CHANGELOG.md — WiseLife

**Propósito:** historial de cambios documentales y del proyecto.
**Responsable:** Documentador Técnico. **Estado:** Activo; requiere mantenerlo en cada entrega.

## 2026-08-08 — Mantenimiento documental
- Se actualizó este historial para registrar la sincronización documental de la rama de trabajo.
- No se modificó código, esquema, infraestructura ni funcionalidad.

## 2026-08-07 — Header: botón "Soy Paciente" reemplaza "Iniciar Sesion"
- Se reemplazó el botón "Iniciar Sesion" (desktop y menú móvil) en `src/components/Header/Header.tsx` por un botón "Soy Paciente", reutilizando el patrón visual del botón "Soy Psicologo" ya existente (variante outline + ícono SVG inline + texto).
- Se añadió un ícono SVG de persona/usuario, distinto al ícono de rayo del botón "Soy Psicologo", para diferenciar ambos botones visualmente.
- La navegación no cambió: el botón sigue apuntando a `/login`.
- Se agregó la variante de color `.btn--outline-cyan` en `src/components/Header/Header.css` (paleta cian/azul `#4dd0e1` / `#42a5f5`, identidad visual de paciente ya usada en el logo y en `.nav-link--active`), análoga a `.btn--outline-accent` (morado, reservada para psicólogo).
- Deuda menor registrada: la clase `.btn--ghost` quedó sin uso en `Header.css` tras este cambio; ver "Migración y deuda conocida" en `COMPONENTES.md`.

## 2026-08-07 — Auditoría y normalización documental
- Se auditó el contenido existente bajo `docs/`, incluidos producto, arquitectura, datos, IA, QA, seguridad, DevOps, SEO, diagramas y documentación oficial previa.
- Se consolidó la información en los 14 documentos oficiales raíz definidos por el proyecto.
- Se registraron pendientes y contradicciones sin inventar decisiones técnicas, de producto o legales.
- No se creó `PROJECT_CONSTITUTION.md` ni `AI_TEAM_CHARTER.md`.
- No se modificó código, esquema, infraestructura ni funcionalidad.

## 2026-08-07 — Documentación oficial inicial
- Se creó la primera estructura documental oficial bajo `docs/oficial/` en el commit `ddcd284`.
- Esta estructura fue absorbida por la normalización actual.

## Política
Cada cambio funcional, técnico, de seguridad, datos, IA, QA o DevOps debe actualizar el documento oficial correspondiente y registrar fecha, responsable, alcance y validaciones.

## Pendientes
Resolver las marcas `[POR DEFINIR]` y mantener este historial alineado con PR, commit y deployment — **Responsable:** Documentador Técnico + responsable del dominio.
