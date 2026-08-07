# Registro oficial de agentes IA de WiseLife

**Versión:** 1.0.0
**Fecha:** 2026-08-07
**Estado:** PENDIENTE DE VALIDACIÓN
**Responsable documental:** Documentador Técnico

## 1. Propósito

Este documento registra únicamente los agentes IA realmente existentes, configurados y autorizados dentro del ecosistema WiseLife. No convierte roles funcionales en agentes, no crea prompts, no asigna plataformas sin evidencia y no sustituye la aprobación humana.

La evidencia del repositorio prevalece sobre las suposiciones. La ausencia de una configuración, prompt, identificador, integración o referencia operativa suficiente se registra explícitamente como agente no confirmado.

## 2. Autoridad y precedencia

La precedencia documental es:

1. `PROJECT_CONSTITUTION.md`: autoridad normativa superior.
2. `AI_TEAM_CHARTER.md`: organización, reglas de colaboración, límites y escalamiento.
3. `AI_AGENT_REGISTRY.md`: inventario operativo de agentes efectivamente identificados.

Este registro no puede contradecir la Constitución ni el Charter. Si existe una contradicción, debe preservarse como **[DECISIÓN PENDIENTE]**, escalarse al responsable del dominio y resolverse mediante actualización documental aprobada.

## 3. Criterios de registro

Un agente sólo se considera confirmado cuando existe evidencia suficiente de su existencia operativa, por ejemplo:

- nombre o identificador explícito;
- prompt o configuración específica;
- archivo de configuración o integración ejecutable;
- referencia inequívoca a una instancia de IA creada previamente;
- evidencia de plataforma y propósito asignados.

Los roles, responsabilidades genéricas, menciones de tecnologías o descripciones de agentes futuros no son evidencia suficiente por sí solas. Las conversaciones no constituyen autoridad de configuración salvo que exista un artefacto persistido y aprobado en el repositorio.

## 4. Inventario de agentes

No se identificaron agentes IA confirmados en el repositorio revisado.

| ID | Nombre | Rol funcional | Plataforma | Estado | Propósito | Responsable humano | Evidencia |
|---|---|---|---|---|---|---|---|
| — | [NO CONFIRMADO] | — | — | NO CONFIRMADO | No existe evidencia suficiente de una instancia de agente IA configurada. | [DECISIÓN PENDIENTE] | No se encontraron prompts, IDs, configuraciones o integraciones de agentes operativos. |

**Agentes confirmados:** 0.

## 5. Fichas individuales

No se crean fichas individuales porque no existe un agente confirmado que documentar. Los roles descritos en `AI_TEAM_CHARTER.md` se mantienen separados del concepto de agente IA.

## 6. Roles sin agente confirmado

Los siguientes roles aparecen como responsabilidades funcionales documentadas, pero no existe evidencia de un agente IA correspondiente:

| Rol | Estado del agente | Observación |
|---|---|---|
| Product Owner | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Scrum Master | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Arquitecto de Software | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Arquitecto UX/UI | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Desarrollador Frontend | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Desarrollador Backend | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Arquitecto de Base de Datos | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Arquitecto de Seguridad y Ciberseguridad | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Ingeniero de IA y Automatización | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Ingeniero QA | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Ingeniero DevOps | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |
| Documentador Técnico | PENDIENTE DE VALIDACIÓN | Rol documentado; agente IA no confirmado. |

No se deben crear agentes para cubrir estos roles sin el proceso de incorporación y aprobación definido en el Charter.

## 7. Plataformas

### Plataformas mencionadas, sin asignación confirmada

- **v0.app:** [PLATAFORMA MENCIONADA — ASIGNACIÓN NO CONFIRMADA].
- **Claude:** [PLATAFORMA MENCIONADA — ASIGNACIÓN NO CONFIRMADA].
- **Antigravity:** [PLATAFORMA MENCIONADA — ASIGNACIÓN NO CONFIRMADA].

Estas menciones no demuestran que exista un agente, ni que una plataforma esté asignada a un rol. No hay plataformas confirmadas para agentes porque el inventario confirmado es cero.

## 8. Matriz Rol → Agente → Plataforma

| Rol | Agente | Plataforma | Estado | Responsable humano |
|---|---|---|---|---|
| Roles del Charter | [NO CONFIRMADO] | [DECISIÓN PENDIENTE] | PENDIENTE DE VALIDACIÓN | [DECISIÓN PENDIENTE] |

La matriz no asigna automáticamente agentes ni plataformas a los roles funcionales.

## 9. Matriz de permisos

No existe un agente confirmado al que puedan asignarse permisos. Por tanto, no se infieren permisos de código, documentación, propuestas, producción o datos sensibles.

| Agente | Código | Documentación | Propuestas | Modificación de código | Producción | Datos sensibles |
|---|---|---|---|---|---|---|
| [NO CONFIRMADO] | NO CONFIRMADO | NO CONFIRMADO | NO CONFIRMADO | NO CONFIRMADO | NO CONFIRMADO | NO CONFIRMADO |

Las reglas del Charter sobre permisos de roles no constituyen permisos de un agente IA concreto.

## 10. Dependencias y colaboración

El `AI_TEAM_CHARTER.md` documenta flujos y colaboración entre roles, pero no confirma instancias de agentes ni colaboraciones automatizadas entre agentes. Por ello, no se registra ninguna dependencia agente-agente.

El flujo documental de referencia —producto, planificación, arquitectura, UX/UI, desarrollo, datos, seguridad, QA, DevOps y documentación— es una coordinación de responsabilidades, no evidencia de agentes IA existentes.

## 11. Agentes pendientes de validación

| Caso | Qué falta confirmar | Por qué importa | Responsable |
|---|---|---|---|
| Agentes IA operativos | Nombre, ID, prompt/configuración y evidencia de ejecución | Evita inventar agentes y permite auditar autoridad | Product Owner + Ingeniero de IA |
| Asignación de roles | Relación rol → agente | Determina alcance, responsabilidad y escalamiento | Product Owner + responsable del dominio |
| Plataformas | Relación agente → plataforma | Determina configuración, permisos y trazabilidad | Ingeniero de IA + DevOps |
| Responsables humanos | Persona o equipo aprobador | Mantiene supervisión y rendición de cuentas | Product Owner |
| Permisos | Código, documentación, producción y datos sensibles | Evita privilegios implícitos | Seguridad + DevOps |
| Prompts/configuraciones | Ubicación, versión y estado | Permite reproducibilidad y control de cambios | Ingeniero de IA + Documentador Técnico |
| Colaboración multi-IA | Flujos entre instancias concretas | Evita conflictos y sobrescrituras | Ingeniero de IA + Arquitecto de Software |

## 12. Conflictos detectados

No se detectaron conflictos entre agentes existentes porque no se identificó ningún agente confirmado.

Se observa una posible fuente de confusión documental: `AI_TEAM_CHARTER.md` describe roles, responsabilidades y un “equipo de agentes”, pero también declara que no asigna nombres, herramientas ni plataformas a roles específicos. Este registro interpreta esas entradas como roles funcionales, no como agentes IA confirmados.

## 13. Reglas para futuros agentes

Todo agente futuro debe:

- evitar inventar hechos, responsabilidades, permisos o configuraciones;
- trabajar dentro de un rol y mandato explícitamente aprobados;
- mantener supervisión humana y escalar decisiones fuera de su alcance;
- conservar trazabilidad entre solicitud, fuente, cambio, validación, commit y PR;
- actualizar la documentación afectada;
- proteger PII, PHI, secretos, credenciales y contexto clínico;
- utilizar mínimo privilegio y no asumir autoridad por la plataforma usada;
- distinguir estado actual, propuesta y **[DECISIÓN PENDIENTE]**;
- no modificar decisiones de otro dominio unilateralmente;
- no diagnosticar ni recomendar clínicamente de forma autónoma;
- detener o escalar conflictos de seguridad, datos, producción o cumplimiento.

## 14. Proceso de incorporación de agentes

El proceso documentado en el Charter es:

```text
Rol
→ Propósito
→ Agente
→ Plataforma
→ Responsable humano
→ Permisos
→ Documentos
→ Límites
→ Dependencias
→ Escalamiento
→ Criterios de finalización
→ Aprobación
```

Antes de activar un agente deben definirse y aprobarse todos los elementos críticos. Si falta alguno, debe registrarse **[DECISIÓN PENDIENTE]** y el agente no debe activarse para tareas fuera de una validación controlada.

La aprobación corresponde al responsable del dominio y a Product Owner cuando afecte alcance. Seguridad, Legal, Base de Datos, QA, DevOps u otros responsables participan según el impacto.

## 15. Control de cambios

| Versión | Fecha | Estado | Responsable | Cambio |
|---|---|---|---|---|
| 1.0.0 | 2026-08-07 | PENDIENTE DE VALIDACIÓN | Documentador Técnico | Inventario inicial; no se identificaron agentes IA confirmados. |

## Fuentes consultadas

Se revisaron:

- `PROJECT_CONSTITUTION.md`
- `AI_TEAM_CHARTER.md`
- `PRODUCT_BACKLOG.md`
- `ROADMAP.md`
- `SPRINT_01.md`
- `ARQUITECTURA.md`
- `BASE_DATOS.md`
- `UX_GUIDE.md`
- `API.md`
- `SEGURIDAD.md`
- `IA.md`
- `DEVOPS.md`
- `PLAN_PRUEBAS.md`
- `COMPONENTES.md`
- `CHANGELOG.md`
- `MANUAL_DESARROLLADOR.md`
- Archivos y configuración versionados del repositorio relacionados con agentes, prompts, IA, v0, Claude y Antigravity.

## Validación final

- No se inventaron agentes.
- No se crearon responsabilidades nuevas.
- No se asignaron plataformas sin evidencia.
- No se convirtieron roles automáticamente en agentes.
- No se encontraron agentes originales confirmables que preservar.
- Toda incertidumbre está marcada como `PENDIENTE DE VALIDACIÓN`, `[NO CONFIRMADO]` o `[DECISIÓN PENDIENTE]`.
- El documento es coherente con la precedencia de `PROJECT_CONSTITUTION.md` y las reglas de `AI_TEAM_CHARTER.md`.
- No se modificó código ni funcionalidad.
- Este archivo es el único documento creado por esta tarea.

---

*WiseLife — Registro oficial de agentes IA*
