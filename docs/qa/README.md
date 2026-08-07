# QA WiseLife

Subcarpeta oficial para el plan maestro de pruebas, resultados y evidencias de calidad de WiseLife.

## Documentos

- [Plan maestro](./TEST_PLAN.md)
- [Resultados de ejecución](./TEST_RESULTS.md)
- [Matriz de trazabilidad](./TRACEABILITY.md)
- [Checklist de seguridad](./SECURITY_CHECKLIST.md)

## Alcance

Frontend React 19 + Vite + TypeScript, React Router, Supabase Auth/Data API, flujos de paciente y psicólogo, reservas, pagos Nequi, citas e historias clínicas.

## Criterios

- **Entrada:** commit actualizado desde `origin/main`, dependencias instaladas, variables de entorno de QA y datos de prueba anonimizados.
- **Salida:** build exitoso, lint sin errores bloqueantes, casos críticos ejecutados, defectos severos documentados y evidencia reproducible.
- **Severidad:** P0 bloqueo/seguridad crítica; P1 flujo principal roto o exposición de datos; P2 degradación relevante; P3 cosmético o mejora.

## Ejecución base

```bash
npm ci
npm run lint
npm run build
npm run dev -- --host 0.0.0.0
```

Las capturas de navegador deben guardarse fuera del repositorio, en `/tmp/agent-browser/`. No almacenar tokens, credenciales ni datos clínicos reales en evidencias.

## Estado de esta entrega

Auditoría ejecutada sobre `main` actualizado y rama `qa`. El build pasa; lint falla con 22 errores y 3 advertencias. La verificación visual desktop/mobile del home fue posible con `agent-browser`; los flujos autenticados requieren cuentas de prueba y ambiente controlado.
