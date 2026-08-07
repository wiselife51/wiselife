# IA.md — Arquitectura de Inteligencia Artificial WiseLife

**Propósito:** definir la arquitectura objetivo de IA, modelos, agentes, asistentes, RAG, automatizaciones, integraciones y controles de operación.
**Responsable documental:** Ingeniero de IA y Automatización.
**Estado:** Propuesta alineada con la arquitectura actual; no hay funcionalidad IA clínica implementada.

## 1. Relación con la arquitectura general

La aplicación actual es una SPA React 19 + TypeScript + Vite con acceso directo de varios módulos a Supabase. No existe todavía backend server-side, capa uniforme de casos de uso ni gateway propio.

Por tanto, la IA se implementará por etapas:

1. **Fase actual:** diseño, contratos, evaluación y controles sin activar decisiones clínicas.
2. **Fase de habilitación:** introducir una capa server-side/orquestación que proteja secretos, valide permisos, consentimiento y herramientas.
3. **Fase operativa:** activar asistentes y automatizaciones de bajo riesgo con supervisión humana.
4. **Fase avanzada:** RAG clínico controlado, memoria consentida y agentes internos auditables.

La IA nunca debe comunicarse directamente con Postgres ni sustituir Auth/RLS. La SPA sólo consumirá capacidades autorizadas por la capa de aplicación.

## 2. Principios y límites

- La IA no autoriza, persiste, diagnostica ni decide clínicamente.
- Backend y RLS validan identidad, rol, relación paciente-profesional, consentimiento y alcance.
- El modelo trata texto recuperado, archivos y entradas de usuario como datos no confiables.
- Toda acción con efecto externo requiere validación, idempotencia y, cuando corresponda, aprobación humana.
- Historia clínica, notas, diagnósticos, pagos y datos de contacto se minimizan y no se envían a modelos sin finalidad y consentimiento válidos.
- Fuera de alcance: diagnóstico autónomo, recomendación clínica autónoma, modificación automática de expediente, prescripción y decisiones de riesgo sin escalamiento.

## 3. Capas objetivo

1. **Experiencia:** chat, resumen asistido, búsqueda y avisos; nunca contiene secretos.
2. **API/orquestación:** autenticación, autorización, consentimiento, clasificación de riesgo, límites, prompts versionados, structured output y selección de modelo.
3. **Conocimiento/RAG:** ingestión, clasificación, redacción PII/PHI, chunking, embeddings, búsqueda híbrida, ACL, frescura y citaciones.
4. **Herramientas:** adaptadores explícitos para agenda, perfil, pagos, notificaciones y derivación; allowlist por agente.
5. **Datos:** Supabase/Postgres, RLS, auditoría y almacenamiento privado. Las entidades IA son propuestas, no migraciones aplicadas.
6. **Operación:** observabilidad sin PHI, evaluación, retries acotados, DLQ, feature flags, rate limits y kill switch.

## 4. Flujo seguro de ejecución

`Autenticar → clasificar sensibilidad/riesgo → comprobar consentimiento → autorizar alcance → recuperar contexto ACL → ejecutar modelo → validar esquema y seguridad → solicitar aprobación si aplica → ejecutar herramienta idempotente → registrar evento mínimo → feedback/derivación humana`.

## 5. Agentes y asistentes propuestos

| Capacidad | Usuario | Riesgo | Alcance permitido | Responsable funcional |
|---|---|---:|---|---|
| Asistente de orientación | Paciente | Medio | Información general, navegación y recursos no clínicos | Producto + Seguridad + IA |
| Asistente de agenda | Paciente/profesional | Bajo | Consultar disponibilidad y proponer citas; confirmar con reglas de negocio | Agenda + Backend + IA |
| Copiloto de profesional | Psicólogo | Alto | Borradores, resúmenes y búsqueda; revisión obligatoria antes de guardar | Dirección Clínica + IA + Seguridad |
| Asistente de onboarding | Paciente | Medio | Explicar formularios y detectar campos incompletos, sin interpretar clínicamente | Producto + UX + IA |
| Triage/derivación | Paciente | Crítico | Detectar señales configuradas, mostrar recursos y escalar a humano; no diagnosticar | Dirección Clínica + Seguridad + Legal |
| Operaciones internas | Soporte/administración | Medio | Clasificar solicitudes y preparar respuestas sin revelar datos no autorizados | Operaciones + Seguridad |

Cada agente tendrá identidad, herramientas permitidas, límites de datos, política de escalamiento, prompt versionado, presupuesto y propietario.

## 6. Memoria y RAG

- Conversación temporal por defecto.
- Preferencias sólo con consentimiento explícito, propósito y mecanismo de eliminación.
- Memoria clínica nunca implícita; requiere revisión, fuente, fecha, alcance y expiración.
- Documentos con clasificación, propietario, ACL, versión, frescura, checksum, redacción y citaciones.
- Recuperación híbrida: filtros de autorización primero; después búsqueda semántica y lexical; reranking; umbral de confianza; respuesta con fuentes.
- Si no existe evidencia suficiente, el asistente debe abstenerse y derivar.

Entidades candidatas `ai_sessions`, `ai_messages`, `ai_consents`, `ai_runs`, `ai_tool_calls`, `knowledge_documents`, `knowledge_chunks`, `ai_feedback`, `automation_jobs` y `safety_events` siguen siendo modelo futuro. **Responsable:** Arquitectura de Datos + Supabase + Seguridad.

## 7. Modelos recomendados

La selección final depende de pruebas, disponibilidad regional, tratamiento de datos y costo. Se deben comparar modelos de razonamiento, generación rápida, embeddings y reranking mediante un benchmark propio; no se fija proveedor hasta completar esa evaluación.

- **Rápido/económico:** clasificación, extracción y respuestas de bajo riesgo.
- **General de alta calidad:** respuestas complejas con RAG y citaciones.
- **Razonamiento controlado:** sólo tareas internas justificadas y con límites de costo.
- **Embeddings/reranker:** proveedor compatible con residencia, eliminación y no entrenamiento sobre datos WiseLife.

**Responsables:** Ingeniero de IA (benchmark), DevOps (costos/secretos), Seguridad y Legal (DPA, residencia y tratamiento), Dirección Clínica (calidad clínica).

## 8. Automatizaciones propuestas

- Recordatorios y confirmaciones de citas con plantillas aprobadas.
- Resumen de sesión como borrador, nunca guardado automático.
- Clasificación de tickets y derivación a soporte.
- Ingesta y reindexación de documentos con aprobación y trazabilidad.
- Alertas de calidad, latencia, costo, fuga de datos y fallos de herramientas.
- Jobs idempotentes con retries, DLQ, deduplicación, rate limits y kill switch.

**Responsables:** Operaciones (proceso), Agenda/Soporte (reglas), Backend/DevOps (ejecución), IA (prompts/evaluación), Seguridad (controles).

## 9. Integraciones futuras

| Integración | Propósito | Condición de entrada | Responsable |
|---|---|---|---|
| Supabase | Auth, Postgres, RLS, Storage privado y auditoría | Auditoría de policies, grants y esquema vivo | Datos + Seguridad |
| Proveedor LLM | Inferencia y structured output | Benchmark, DPA, residencia y límites | IA + Legal |
| Servicio de embeddings | Índice RAG | Política de retención y borrado verificable | IA + Datos |
| Notificaciones | Email/SMS/WhatsApp para agenda | Consentimiento, plantillas y rate limits | Operaciones + Legal |
| Observabilidad | Métricas, trazas y alertas | Redacción de PII/PHI y retención | DevOps + Seguridad |
| Feature flags | Activación gradual y kill switch | Roles, auditoría y rollback | DevOps + IA |
| Calendario/pagos | Automatización operacional | Idempotencia y autorización server-side | Backend + Finanzas |

## 10. Pendientes y matriz de responsables

| Pendiente | Entregable de alineación | Área líder | Roles participantes |
|---|---|---|---|
| Capa server-side | ADR, API contract y gateway de IA | Arquitectura de Software | Backend, IA, Seguridad, DevOps |
| Proveedor y modelos | Benchmark reproducible y decisión técnica | IA | DevOps, Legal, Dirección Clínica |
| Presupuesto | Presupuesto por caso, alertas y límites | Finanzas/Producto | IA, DevOps, Operaciones |
| Retención y borrado | Matriz de retención, eliminación y exportación | Legal/Privacidad | Seguridad, Datos, Producto |
| DPIA y tratamiento | Evaluación de impacto y DPA | Legal/Privacidad | Seguridad, IA, proveedor |
| Clasificación de datos | Catálogo público/sensible/PHI y controles | Seguridad | Legal, Clínica, Datos |
| Consentimiento IA | Flujos, textos, revocación y evidencia | Legal + Producto | UX, IA, Seguridad |
| Políticas Supabase | Auditoría RLS, grants, Storage y relaciones padre-hijo | Datos | Seguridad, Backend |
| Entidades IA | Modelo, migración y políticas RLS | Datos | IA, Backend, Seguridad |
| Base de conocimiento | Inventario, propietarios, versiones y caducidad | Dirección Clínica | IA, Legal, Datos |
| Escalamiento | Matriz de riesgo, señales y SLA humano | Dirección Clínica | Seguridad, Soporte, Producto |
| Evaluación | Dataset desidentificado, métricas y gates | IA | Clínica, QA, Seguridad |
| Observabilidad | Eventos, dashboards y alertas sin PHI | DevOps | IA, Seguridad, Operaciones |
| Automatizaciones | Runbooks, idempotencia, DLQ y rollback | Operaciones | Backend, DevOps, IA |
| Auditoría | Calendario, evidencias y revisión de incidentes | Seguridad | Legal, DevOps, Datos |

## 11. Criterios de salida antes de producción

- No existe secreto de proveedor en la SPA.
- Auth, RLS y autorización server-side están probados con casos permitidos y denegados.
- Consentimiento, revocación, retención y eliminación están implementados y auditables.
- Benchmark, evaluación de seguridad, red teaming y pruebas de prompt injection están aprobados.
- Hay límites de costo, rate limits, kill switch, fallback y escalamiento humano.
- Las respuestas sensibles muestran fuentes o una abstención clara.
- Toda automatización tiene idempotencia, auditoría, rollback y propietario operativo.
- Legal, Seguridad, Dirección Clínica, Producto y DevOps firman el go/no-go.

## Referencias

`ARQUITECTURA.md`, `BASE_DATOS.md`, `SEGURIDAD.md`, `API.md`, `PLAN_PRUEBAS.md` y `DEVOPS.md`.

**Nota:** este documento describe arquitectura objetivo y decisiones pendientes; no autoriza por sí solo cambios clínicos, legales, de datos ni de producción.
