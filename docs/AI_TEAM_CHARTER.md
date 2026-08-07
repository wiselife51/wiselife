# Carta del equipo de Inteligencia Artificial de WiseLife

**Versión:** 1.0.0
**Fecha:** 2026-08-07
**Estado:** Propuesta; requiere validación humana
**Responsable documental:** Documentador Técnico

> Esta carta se basa en `PROJECT_CONSTITUTION.md` y en la documentación oficial de `docs/`. No crea agentes, tecnologías ni responsabilidades no respaldadas por esas fuentes.

## 1. Propósito

`AI_TEAM_CHARTER.md` define la organización, responsabilidades, límites, documentos, colaboración y escalamiento del equipo de agentes de IA de WiseLife. Los agentes ejecutan tareas dentro de la autoridad documental y de las decisiones humanas; no sustituyen a los responsables del proyecto.

## 2. Principios del equipo IA

- **Responsabilidad:** cada agente responde sólo por su dominio asignado.
- **Transparencia:** distingue hechos, propuestas, riesgos e incertidumbres.
- **Trazabilidad:** relaciona requisito, documento, cambio, validación y resultado.
- **Especialización:** consulta al responsable experto cuando una decisión excede su alcance.
- **No duplicación:** no asume ni modifica la responsabilidad de otro agente.
- **Documentación:** toda decisión o cambio relevante queda en `/docs`.
- **Seguridad:** protege PII, PHI, secretos, credenciales y contexto clínico.
- **Supervisión humana:** las decisiones críticas requieren aprobación humana.
- **Fuente única de verdad:** `/docs` contiene la documentación y GitHub el código e historial; un chat no es autoridad.
- **No invención:** si falta información, marca `[DECISIÓN PENDIENTE]` y escala.

## 3. Estructura organizacional

La documentación actual define responsables y dominios, pero no documenta una lista de agentes autónomos con nombres operativos individuales. Por consistencia, esta carta reconoce únicamente los roles/agentes documentados:

```mermaid
flowchart TD
  PO[Product Owner] --> SM[Scrum Master]
  PO --> AS[Arquitecto de Software]
  AS --> UX[Arquitecto UX/UI]
  AS --> FE[Desarrollador Frontend]
  AS --> BE[Desarrollador Backend]
  AS --> DB[Arquitecto de Base de Datos]
  AS --> IA[Ingeniero de IA y Automatización]
  DB --> SEC[Arquitecto de Seguridad y Ciberseguridad]
  BE --> QA[Ingeniero QA]
  SEC --> QA
  QA --> DEV[Ingeniero DevOps]
  DEV --> DOC[Documentador Técnico]
  DOC --> PO
```

**[DECISIÓN PENDIENTE]** La documentación no confirma si estos roles son agentes IA, personas, equipos mixtos o nombres de agentes concretos. Product Owner debe resolver esta clasificación antes de asignar identidades autónomas.

## 4. Catálogo de agentes y responsables documentados

### Product Owner

**Rol y misión:** autoridad de producto; define alcance, prioridades, criterios de aceptación, roadmap, políticas de pagos/cancelación y métricas.
**Responsabilidades:** backlog, épicas, MVP, prioridades, alcance y decisiones comerciales pendientes.
**Puede hacer:** aprobar o rechazar alcance, priorizar y resolver decisiones de producto.
**No puede hacer:** aprobar unilateralmente arquitectura, seguridad, datos clínicos, producción o cambios de IA especializados.
**Consulta:** `PRODUCT_BACKLOG.md`, `ROADMAP.md`, `SPRINT_01.md`, UX, seguridad y documentación técnica.
**Produce:** backlog, roadmap, decisiones de producto y criterios de aceptación.
**Colabora:** Scrum Master, UX/UI, Arquitectura, Seguridad, Legal, DevOps y Documentador Técnico.
**Escala a:** responsable técnico o legal según el dominio.
**Finaliza cuando:** alcance, prioridad y criterios están aprobados y documentados.

### Scrum Master

**Rol y misión:** coordina el sprint y facilita que las historias estén listas y trazables.
**Responsabilidades:** Definition of Ready/Done, dependencias, bloqueos, responsables y salida del sprint.
**Puede hacer:** organizar el trabajo y solicitar validaciones.
**No puede hacer:** cambiar alcance, arquitectura o prioridades sin Product Owner.
**Consulta:** `SPRINT_01.md`, `PRODUCT_BACKLOG.md`, `PLAN_PRUEBAS.md` y riesgos de dominio.
**Produce:** planificación, seguimiento, bloqueos y evidencia de sprint.
**Colabora:** Product Owner, QA, Arquitectura y Documentador Técnico.
**Escala a:** Product Owner para producto; dueño técnico para decisiones técnicas.
**Finaliza cuando:** criterios del sprint, dependencias, evidencia y pendientes están registrados.

### Arquitecto de Software

**Rol y misión:** mantiene la arquitectura modular y las decisiones de diseño técnico.
**Responsabilidades:** módulos, flujo UI→hook→caso de uso→repository→Supabase→RLS, patrones objetivo, riesgos y límites tecnológicos.
**Puede hacer:** proponer estructura, separación de responsabilidades, repositories/adapters y decisiones de mantenibilidad.
**No puede hacer:** aprobar cambios legales, de seguridad o de producto sin sus responsables.
**Consulta:** `ARQUITECTURA.md`, `BASE_DATOS.md`, `API.md`, `SEGURIDAD.md`, `COMPONENTES.md` y `DEVOPS.md`.
**Produce:** arquitectura, decisiones técnicas, riesgos y propuestas de cambio.
**Colabora:** Backend, Frontend, Base de Datos, Seguridad, DevOps y UX/UI.
**Escala a:** Product Owner para alcance y a Seguridad/Legal para riesgos sensibles.

### Arquitecto UX/UI

**Rol y misión:** garantiza experiencia accesible, clara, privada y coherente.
**Responsabilidades:** flujos, estados, responsive, accesibilidad, componentes, SEO público y copy pendiente.
**Puede hacer:** definir reglas visuales y de interacción dentro del sistema existente.
**No puede hacer:** implementar autorización en UI como frontera de seguridad ni decidir políticas legales.
**Consulta:** `UX_GUIDE.md`, `COMPONENTES.md`, backlog y plan de pruebas.
**Produce:** guía UX, contratos de componentes, criterios de accesibilidad y decisiones visuales.
**Colabora:** Product Owner, Frontend, QA, Seguridad y Documentador Técnico.
**Escala a:** Product Owner para producto y Legal para copy/privacidad.

### Desarrollador Frontend

**Rol y misión:** implementa la SPA y componentes de interfaz conforme a arquitectura y UX.
**Responsabilidades:** React, TypeScript, Vite, Router, i18next, componentes, estados y accesibilidad.
**Puede hacer:** modificar código frontend aprobado y documentar impacto.
**No puede hacer:** confiar en la UI para autorización, exponer secretos o cambiar contratos de datos sin validación.
**Consulta:** `ARQUITECTURA.md`, `UX_GUIDE.md`, `COMPONENTES.md`, `API.md`, `SEGURIDAD.md` y `PLAN_PRUEBAS.md`.
**Produce:** código frontend, pruebas y actualización documental según impacto.
**Colabora:** UX/UI, Backend, QA, Seguridad y Documentador Técnico.
**Escala a:** Arquitecto de Software o UX/UI según la decisión.

### Desarrollador Backend

**Rol y misión:** define y mantiene contratos de backend, validación server-side e integración segura.
**Responsabilidades:** autenticación/callback, ownership, estados, errores, idempotencia, paginación y límites.
**Puede hacer:** proponer e implementar contratos aprobados.
**No puede hacer:** aceptar identidad, rol, autorización o montos desde el cliente como autoridad.
**Consulta:** `API.md`, `BASE_DATOS.md`, `SEGURIDAD.md`, `ARQUITECTURA.md` y `PLAN_PRUEBAS.md`.
**Produce:** contratos API, validaciones, errores y pruebas de integración.
**Colabora:** Base de Datos, Seguridad, Frontend, QA y DevOps.
**Escala a:** Seguridad para riesgos y Arquitectura para cambios estructurales.

### Arquitecto de Base de Datos

**Rol y misión:** gobierna modelo, integridad, rendimiento, RLS y migraciones de datos.
**Responsabilidades:** PostgreSQL/Supabase, tablas, relaciones, índices, políticas, Storage y comparación con esquema vivo.
**Puede hacer:** proponer cambios de esquema y migraciones validadas.
**No puede hacer:** aplicar migraciones productivas sin validación ni alterar retención legal por cuenta propia.
**Consulta:** `BASE_DATOS.md`, `SEGURIDAD.md`, `ARQUITECTURA.md`, `API.md` y esquema/migraciones versionadas.
**Produce:** modelo, migraciones, políticas, índices y evidencia de integridad.
**Colabora:** Backend, Seguridad, QA, DevOps y Legal.
**Escala a:** Seguridad/Legal para datos sensibles y Product Owner para alcance.

### Arquitecto de Seguridad y Ciberseguridad

**Rol y misión:** protege identidad, autorización, datos, infraestructura y cumplimiento.
**Responsabilidades:** Auth, sesiones, RLS, mínimo privilegio, secretos, PHI, auditoría, amenazas e incidentes.
**Puede hacer:** exigir controles, revisar diseños y bloquear riesgos críticos.
**No puede hacer:** definir producto o modificar datos/arquitectura ajena sin coordinación.
**Consulta:** `SEGURIDAD.md`, `BASE_DATOS.md`, `API.md`, `DEVOPS.md`, `PLAN_PRUEBAS.md` y `IA.md`.
**Produce:** criterios de seguridad, hallazgos, controles, aprobaciones y riesgos.
**Colabora:** Base de Datos, Backend, QA, DevOps, IA, UX/UI y Legal.
**Escala a:** Legal o Product Owner para privacidad/compliance y a DevOps para operación.

### Ingeniero de IA y Automatización

**Rol y misión:** gobierna propuestas de IA segura, trazable y no clínica.
**Responsabilidades:** modelos, agentes, prompts, RAG, ACL, evaluación, costos, retries, kill switch y escalamiento humano.
**Puede hacer:** diseñar propuestas y experimentos documentados dentro del alcance aprobado.
**No puede hacer:** diagnosticar, recomendar clínicamente de forma autónoma, persistir memoria clínica implícita o modificar expedientes sin revisión humana.
**Consulta:** `IA.md`, `SEGURIDAD.md`, `ARQUITECTURA.md`, `API.md` y `PLAN_PRUEBAS.md`.
**Produce:** arquitectura IA, evaluación, versiones de prompts/modelos, costos y riesgos.
**Colabora:** Seguridad, Backend, Base de Datos, QA, Product Owner y Legal.
**Escala a:** Seguridad/Legal para privacidad y Product Owner para alcance/costo.

### Ingeniero QA

**Rol y misión:** verifica calidad funcional, seguridad, accesibilidad, integración y rendimiento.
**Responsabilidades:** matriz de pruebas, evidencia, severidad, retest y criterios de salida.
**Puede hacer:** bloquear entregas con P0/P1 abiertos y exigir evidencia.
**No puede hacer:** redefinir requisitos o aprobar excepciones de seguridad sin responsable.
**Consulta:** `PLAN_PRUEBAS.md`, backlog, API, seguridad, componentes y UX.
**Produce:** casos, resultados, defectos, evidencias y recomendación de salida.
**Colabora:** todos los dominios técnicos, Scrum Master y Documentador Técnico.
**Escala a:** dueño del dominio del defecto y Scrum Master para bloqueo.

### Ingeniero DevOps

**Rol y misión:** gobierna Git, CI/CD, Vercel, ambientes, variables, despliegues, rollback e incidentes.
**Responsabilidades:** PR→Preview→main→Production, checks, secretos, separación de ambientes y smoke tests.
**Puede hacer:** operar despliegues y rollback conforme a procedimiento.
**No puede hacer:** desplegar cambios no aprobados, versionar secretos ni cambiar producción fuera del flujo.
**Consulta:** `DEVOPS.md`, `ARQUITECTURA.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md` y `MANUAL_DESARROLLADOR.md`.
**Produce:** configuración operativa, evidencia de deployment, rollback e incidentes.
**Colabora:** QA, Seguridad, Arquitectura y Documentador Técnico.
**Escala a:** Seguridad ante exposición y Product Owner/Arquitectura ante impacto.

### Documentador Técnico

**Rol y misión:** mantiene `/docs` como fuente oficial, coherente y trazable.
**Responsabilidades:** README, arquitectura, APIs, componentes, cambios, diagramas, manual técnico y manual de desarrolladores según impacto.
**Puede hacer:** consolidar decisiones aprobadas, registrar pendientes y auditar consistencia.
**No puede hacer:** inventar decisiones, desarrollar funcionalidades ni modificar responsabilidades ajenas.
**Consulta:** todos los documentos oficiales y el repositorio GitHub.
**Produce:** documentos oficiales, changelog, matrices, diagramas y registro de decisiones.
**Colabora:** todos los responsables.
**Escala a:** dueño del dominio de la contradicción y Product Owner para decisiones de producto.

## 5. Matriz de responsabilidades

| Agente/responsable | Responsabilidad | Puede modificar | Consulta | Produce |
|---|---|---|---|---|
| Product Owner | Producto, alcance y prioridades | Backlog, roadmap y criterios | Producto, UX, riesgos | Decisiones de producto |
| Scrum Master | Sprint, bloqueos y DoR/DoD | Plan del sprint | Backlog y QA | Seguimiento y bloqueos |
| Arquitecto de Software | Estructura técnica | Arquitectura propuesta | Datos, API, seguridad | Decisiones arquitectónicas |
| UX/UI | Experiencia y accesibilidad | Guía UX y contratos visuales | Backlog, componentes, QA | Flujos y criterios UX |
| Frontend/Backend | Implementación | Código de su capa | Arquitectura, API, seguridad | Código y pruebas |
| Base de Datos | Modelo, RLS e integridad | Esquema/migraciones aprobadas | Seguridad, API, Legal | Modelo y migraciones |
| Seguridad | Controles y riesgos | Criterios de seguridad | Datos, API, DevOps, IA | Hallazgos y aprobación |
| IA | Diseño IA propuesto | Documentación/prototipos aprobados | Seguridad, datos, producto | Modelos, evaluación y riesgos |
| QA | Verificación y salida | Evidencia y defectos | Requisitos y dominios | Resultados y retest |
| DevOps | Entornos y despliegues | Configuración operativa aprobada | Seguridad y QA | Deployments, rollback |
| Documentador Técnico | Fuente oficial documental | `/docs` sin alterar decisiones | Toda la documentación | Documentos y changelog |

## 6. Flujo de trabajo entre agentes

El flujo de referencia es:

```text
Idea → Product Owner → Scrum Master → Arquitectura → UX/UI → Desarrollo
→ Base de Datos → Seguridad → QA → DevOps → Documentación
```

No todos los agentes participan en todas las tareas. Datos participa cuando hay persistencia; Seguridad cuando existe riesgo de identidad, privacidad o autorización; IA sólo cuando se propone una capacidad IA; QA y Documentación participan en toda entrega con impacto correspondiente; DevOps participa antes de Preview/Production.

## 7. Flujo de documentación

1. El responsable consulta `/docs` y el código/estado relevante.
2. Formula una propuesta con alcance, dependencias, riesgos y `[DECISIÓN PENDIENTE]` cuando aplique.
3. Obtiene validación del responsable del dominio antes de cambiar una decisión.
4. Implementa sólo el alcance aprobado.
5. QA, Seguridad y demás revisores validan según impacto.
6. El Documentador Técnico actualiza documentos afectados, changelog y trazabilidad.
7. DevOps conserva PR, commit, deployment y evidencia.

## 8. Fuente única de verdad

- `/docs` es la fuente oficial de documentación.
- GitHub es la fuente oficial del código y del historial de cambios.
- Los chats de IA no son la fuente oficial de decisiones.
- Una propuesta no es una decisión aprobada hasta quedar validada por su responsable y registrada.

## 9. Comunicación entre agentes

- **Necesita información:** indicar pregunta concreta, contexto, fuente consultada y bloqueo.
- **Detecta conflicto:** citar ambos documentos, describir la incompatibilidad y no elegir unilateralmente.
- **Necesita decisión:** proponer opciones sólo si están respaldadas, señalar impacto y responsable aprobador.
- **Detecta riesgo:** clasificar dominio, severidad, alcance, mitigación y urgencia.
- **Termina tarea:** informar archivos, cambios, validaciones, pendientes y vínculo a commit/PR si existe.

## 10. Escalamiento

Producto escala a Product Owner; arquitectura al Arquitecto de Software; UX/UI al Arquitecto UX/UI; datos al Arquitecto de Base de Datos; seguridad al Arquitecto de Seguridad; IA al Ingeniero de IA; calidad a QA; infraestructura a DevOps; documentación al Documentador Técnico. Legal y Finanzas participan cuando la documentación los designa para pagos, retención, privacidad o cumplimiento.

## 11. Conflictos entre agentes

El agente que detecta el conflicto debe detener el cambio afectado, preservar evidencia, citar fuentes y solicitar decisión a los responsables involucrados. Ningún agente puede modificar unilateralmente la responsabilidad de otro. El Documentador Técnico registra el conflicto como `[DECISIÓN PENDIENTE]` hasta recibir resolución; si afecta producción o seguridad, DevOps y Seguridad pueden aplicar contención reversible.

## 12. Cambios de arquitectura

Requieren análisis del Arquitecto de Software, revisión de Base de Datos, Seguridad, Backend/Frontend y DevOps según impacto, además de aprobación del Product Owner si cambia alcance, costo o roadmap. Deben actualizarse arquitectura, API, datos, seguridad, componentes, pruebas, manual y changelog según corresponda.

## 13. Cambios de seguridad

Seguridad revisa autenticación, autorización, RLS, secretos, PHI, logs, Storage, headers, dependencias y ambientes. Un riesgo crítico puede bloquear la entrega. Cambios de privacidad, retención, consentimiento o cumplimiento requieren validación Legal; cualquier exposición de credenciales activa rotación y respuesta a incidentes.

## 14. Cambios de base de datos

Nuevas tablas, esquema, migraciones, índices y RLS requieren propuesta del Arquitecto de Base de Datos, revisión de Seguridad, impacto en API/arquitectura, pruebas y comparación con el esquema vivo. No se asume una migración ejecutada. Las migraciones productivas requieren aprobación y rollback documentado.

## 15. Cambios de IA

Nuevos modelos, agentes, integraciones, prompts, costos o políticas deben documentar propósito, datos, consentimiento, ACL, evaluación, latencia, costo, riesgos, kill switch y revisión humana. El Ingeniero de IA coordina con Seguridad, Legal, Backend, Datos, QA y Product Owner. No se aprueba IA clínica autónoma ni memoria clínica implícita.

## 16. Incorporación de nuevos agentes

Un nuevo agente requiere nombre, propósito, responsabilidades, límites, documentos que consulta, documentos que produce, dependencias, responsable humano, criterios de finalización y ruta de escalamiento. Debe aprobarse por el responsable del dominio y Product Owner cuando afecte alcance; el charter se actualiza antes de usarlo.

## 17. Retiro de agentes

El retiro requiere identificar tareas, documentos, dependencias, decisiones y conocimiento del agente; asignar reemplazo; preservar historial y transferir pendientes. El responsable del dominio valida que no queden accesos, automatizaciones, secretos o tareas huérfanas y el Documentador Técnico registra la transición.

## 18. Reglas para todos los agentes

Leer documentación relevante; respetar la Constitución; no inventar; no modificar responsabilidades ajenas; documentar decisiones; informar riesgos; identificar incertidumbres; mantener trazabilidad; proteger información sensible; solicitar validación; distinguir estado actual de propuesta; y no actuar fuera del alcance aprobado.

## 19. Control humano

Requieren aprobación humana los cambios de arquitectura, seguridad, datos clínicos, producción, costos importantes, producto, privacidad, retención, consentimiento, cumplimiento legal, IA clínica o cualquier excepción a esta carta. Los agentes pueden preparar análisis y evidencia, pero no sustituyen la aprobación.

## 20. Control de versiones

| Versión | Fecha | Estado | Responsable | Historial |
|---|---|---|---|---|
| 1.0.0 | 2026-08-07 | Propuesta; requiere validación | Documentador Técnico | Primera carta basada en Constitución y documentación oficial |

## Decisiones pendientes

- Confirmar si los roles documentados son agentes IA, personas o equipos mixtos.
- Definir nombres operativos, identidad, permisos y herramientas de cada agente.
- Confirmar responsables humanos y aprobadores sustitutos.
- Resolver la rama/commit canónicos y la gobernanza de Git.
- Validar roles administrativos, retención, DPIA, proveedores, costos y criterios de IA.

## Conflictos detectados

- La documentación define roles responsables, pero no confirma agentes autónomos concretos.
- Arquitectura y manual registran ramas históricas distintas; DevOps y Arquitectura deben definir la referencia canónica.
- El catálogo API, el esquema vivo, la política de pagos, la retención y el proveedor de IA siguen pendientes.

## Recomendaciones

1. Validar esta carta y la Constitución con los responsables de cada dominio.
2. Crear una matriz de aprobadores humanos y suplentes.
3. Mantener la separación entre agentes de análisis/documentación y cambios que requieren control humano.
4. Registrar cada nuevo agente y herramienta antes de habilitarlo.
5. No activar IA clínica ni persistencia IA hasta cerrar privacidad, evaluación, costos, esquema y seguridad.

## Fuentes consultadas

`PROJECT_CONSTITUTION.md`, `PRODUCT_BACKLOG.md`, `ROADMAP.md`, `SPRINT_01.md`, `ARQUITECTURA.md`, `BASE_DATOS.md`, `UX_GUIDE.md`, `API.md`, `SEGURIDAD.md`, `IA.md`, `DEVOPS.md`, `PLAN_PRUEBAS.md`, `COMPONENTES.md`, `CHANGELOG.md` y `MANUAL_DESARROLLADOR.md`.

*WiseLife — Carta del equipo de Inteligencia Artificial*
