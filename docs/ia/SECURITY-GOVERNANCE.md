# Seguridad y gobernanza

## Principios
Cumplir Ley 1581 de Colombia y evaluar GDPR/HIPAA cuando corresponda. Propósito limitado, consentimiento informado, minimización, exactitud, retención definida, acceso/corrección/borrado y trazabilidad. Ningún agente diagnostica, prescribe o reemplaza profesionales.

## Controles técnicos
- Supabase Auth + RLS como frontera; el modelo no decide autorización.
- Tenant, actor y rol vienen de sesión verificada, nunca del prompt.
- Redacción/tokenización PII/PHI antes de proveedores; cifrado en tránsito/reposo.
- Separación de índices por sensibilidad y tenant; no entrenamiento con contenido de usuarios.
- Secretos solo en gestor de variables; jamás en frontend, prompts o logs.
- Validación de esquema, allowlist de herramientas, límites de tokens, rate limits y budgets.
- Protección contra prompt injection, tool abuse, cross-tenant retrieval, poisoning, SSRF y exfiltración.

## Seguridad clínica y crisis
El sistema debe reconocer señales de riesgo con clasificador + reglas y responder con lenguaje seguro, recursos de emergencia por país y derivación humana. No debe prometer confidencialidad absoluta ni dar instrucciones peligrosas. Los umbrales, copy y rutas deben ser aprobados por profesionales.

## Gobernanza del ciclo de vida
Registro de cada prompt/modelo/dataset, dueño, propósito, riesgo, evaluación, fecha de revisión y rollback. Cambios de alto riesgo requieren revisión clínica, seguridad y arquitectura; producción requiere canary, monitorización y kill switch.

## Criterios de bloqueo
Bloquear publicación si hay fuga de datos, citación falsa material, tool call no autorizada, crisis mal manejada, discriminación significativa, ausencia de consentimiento, evaluación incompleta, secreto expuesto o RLS no verificado.

## Auditoría
Conservar evento mínimo: quién, propósito, política, versión, fuentes, herramientas, resultado de seguridad, latencia y costo. Separar contenido clínico del log operativo y limitar acceso por necesidad de conocer. Probar derechos de datos, eliminación, exportación, incident response y restauración.
