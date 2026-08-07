# Integraciones actuales y futuras

## Actuales
- **Supabase:** Auth, Postgres, RLS, Storage y auditoría. El servicio de IA usa sesión de servidor y consultas autorizadas; nunca expone service role al cliente.
- **Vercel/GitHub/CI:** despliegue, variables, previews, tests de evaluación y rollback. Separar secretos por entorno.
- **Pagos/Nequi:** solo automatizaciones operativas y conciliación; no enviar datos clínicos al proveedor.

## Horizonte futuro
| Área | Integración posible | Requisitos |
|---|---|---|
| Notificaciones | email, SMS, WhatsApp | opt-in, plantillas, rate limit, webhook firmado |
| Agenda | Google/Outlook Calendar | OAuth mínimo, scopes limitados, revocación |
| Voz | telefonía, ASR/TTS | consentimiento explícito, transcripción efímera |
| Vector | pgvector/Supabase Vector, Qdrant o Pinecone | ACL, residencia, borrado, backup |
| Observabilidad | trazas, métricas, alertas | redacción PII/PHI y control de acceso |
| Feature flags | flags por tenant/capacidad | kill switch y canary |
| Modelos | gateway multi-proveedor | no entrenamiento con datos, timeout, fallback |
| Conocimiento | almacenamiento documental y CMS | workflow de aprobación, hash, versionado |

## Clasificación de datos
- **Público:** material educativo aprobado.
- **Personal:** preferencias y contacto, minimizados.
- **Sensible:** bienestar, citas y comunicaciones privadas.
- **Clínico restringido:** historia, notas y diagnósticos; acceso profesional justificado.
- **Secreto:** credenciales, tokens y claves; nunca prompt ni logs.

Cada integración necesita DPA/contrato, residencia, retención, subprocesadores, OAuth/webhooks, revocación, pruebas de fallo y plan de salida. No se conectará una herramienta externa solo por conveniencia si una regla determinista o Supabase resuelve el caso.
