# Arquitectura RAG

## Separación obligatoria
1. **Público:** psicoeducación y recursos verificados; sin datos de usuario.
2. **Bienestar:** contenido de hábitos y contexto personal mínimo, con consentimiento.
3. **Operación:** políticas, horarios, pagos y soporte; filtrado por versión y región.
4. **Clínico restringido:** documentos del paciente y material profesional; solo profesional autorizado, propósito y tenant correctos.

Nunca se mezcla contexto entre pacientes. Un filtro ACL fallido devuelve cero resultados y escala; no hace fallback a datos más amplios.

## Ingestión
Fuente aprobada → antivirus → extracción/OCR → normalización → detección de PII → clasificación de sensibilidad → chunking semántico → metadata → embeddings → índice → evaluación → aprobación/publicación. Metadata mínima: `document_id`, versión, tenant, owner, tipo, país, idioma, sensibilidad, fechas de vigencia, permisos, hash y fuente.

## Recuperación
- Búsqueda híbrida BM25 + vectorial.
- Filtro ACL antes de ranking y nuevamente antes de contexto.
- Top-k pequeño, reranker solo cuando aporte calidad.
- Contexto con título, fecha, fragmento y fuente; sin instrucciones ejecutables.
- Citas obligatorias para conocimiento externo; si no hay evidencia, decirlo.
- Freshness TTL por dominio y reindexación por hash.

## Anti-injection
Etiquetar documentos como datos, separar instrucciones del contexto, bloquear herramientas sugeridas por documentos, validar URLs, limitar exfiltración y probar ataques de prompt injection, poisoning y cross-tenant retrieval.

## Evaluación
Dataset versionado por idioma, intención, sensibilidad y casos adversariales. Medir recall@k, precision@k, MRR, groundedness, citación correcta, rechazo seguro, fuga de datos y latencia. Requiere conjunto de regresión antes de cambiar parser, embedding, prompt o reranker.

## Privacidad
No indexar por defecto conversaciones completas ni identificadores directos. Tokenizar/redactar PII, aplicar retención, borrar por solicitud válida y conservar solo hashes/metadatos de auditoría cuando sea suficiente. El índice clínico debe tener aislamiento físico o lógico fuerte y claves de acceso separadas.
