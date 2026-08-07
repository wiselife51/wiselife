# Plan maestro de pruebas WiseLife

## 1. Objetivo

Validar que WiseLife sea funcional, seguro, accesible, responsive y operable antes de una entrega a usuarios reales. El plan distingue pruebas ejecutadas de casos pendientes por requerir datos, cuentas o servicios externos.

## 2. Roles y ambientes

| Rol | Capacidades a validar |
|---|---|
| Anónimo | Landing, navegación pública, login, registro/callback |
| Paciente | onboarding, encuestas, perfil, especialistas, reserva, pago, citas |
| Psicólogo | onboarding profesional, dashboard, disponibilidad, citas, notas clínicas |
| Usuario no autorizado | Denegación de rutas, IDs ajenos y operaciones no permitidas |

Ambientes: preview local para smoke/UI; Supabase conectado para integración; staging aislado para seguridad, carga y datos sintéticos.

## 3. Pruebas funcionales

### F01 — Navegación pública

- Abrir `/`, navegar por Servicios, Especialistas, Proceso, Precios, Testimonios y Contacto.
- Verificar botones `Agenda tu Cita`, `Iniciar Sesion` y `Soy Psicologo`.
- Confirmar que no existan enlaces muertos, `href="#"` no intencionales ni rutas no declaradas.

### F02 — Autenticación

- Login válido, inválido, campos vacíos y contraseña incorrecta.
- Registro, confirmación de email, callback `/auth/callback`, sesión persistente y logout.
- Rechazar acceso a dashboards sin sesión y mantener mensajes de error no enumerables.

### F03 — Onboarding y encuestas

- Completar onboarding de paciente y psicólogo.
- Validar campos obligatorios, formatos, reintentos, refresh y navegación atrás.
- Verificar persistencia y que un usuario no pueda editar el onboarding de otro.

### F04 — Especialistas y perfil

- Listar, buscar/filtrar y abrir `/especialista/:id`.
- Estados de carga, vacío, error y especialista inexistente.
- Confirmar que información privada no sea visible a anónimos.

### F05 — Reserva y pago

- Seleccionar disponibilidad, fecha/hora y confirmar cita.
- Validar conflicto de horario, doble envío, cancelación y estado pendiente/confirmado.
- Validar número Nequi configurado, comprobante/estado y que montos/IDs se recalculen en servidor.

### F06 — Citas y perfil del paciente

- Consultar próximas/históricas, cancelar según política y actualizar perfil/avatar.
- Confirmar consistencia tras refresh y manejo offline/reintento.

### F07 — Dashboard del psicólogo

- Crear/editar/eliminar disponibilidad y bloqueos.
- Consultar agenda, aceptar/rechazar/cerrar cita y recibir estados actualizados.
- Crear/consultar notas e historia clínica únicamente del paciente asignado.

## 4. Integración

- React Router ↔ guards y redirecciones.
- `AuthContext` ↔ Supabase Auth, refresh y cierre de sesión.
- Consultas Supabase ↔ estados loading/error/empty/success.
- Citas, disponibilidad, perfiles e historias clínicas ↔ RLS y claves foráneas.
- Nequi/configuración ↔ reserva sin duplicación ni mutaciones parciales.
- Probar timeout, respuesta 4xx/5xx, desconexión, retry e idempotencia.

## 5. Seguridad

- RLS por usuario, paciente/psicólogo y recursos clínicos.
- BOLA/IDOR cambiando UUIDs en consultas y URLs.
- No exponer service-role/secret keys al bundle.
- Validar inputs, XSS en nombres/notas, open redirects y URLs externas.
- Rate limiting para auth y operaciones sensibles.
- Cookies/sesiones, logout, expiración, revocación y CSRF según arquitectura.
- Logs sin tokens, contraseñas, historias clínicas ni teléfonos completos.

## 6. Rendimiento

Presupuestos iniciales: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms en staging; JS principal gzip ≤ 250 KB como objetivo; evitar chunks no divididos >500 KB.

- Medir Lighthouse/Web Vitals en 375×667 y 1440×900.
- Medir carga del hero/video, imágenes, fuentes y lazy loading.
- Medir latencia p50/p95 de queries Supabase y navegación.
- Cargar 50/500 especialistas y citas sintéticas; revisar paginación y renders.
- Ejecutar prueba de 10 minutos con sesiones simultáneas en staging.

## 7. Accesibilidad WCAG 2.2 AA

- Navegación completa por teclado, foco visible y orden lógico.
- Labels, nombres accesibles, landmarks, headings y botones reales.
- Contraste ≥4.5:1 texto normal y ≥3:1 texto grande/componentes.
- Errores asociados a campos, mensajes anunciados y validación comprensible.
- Modales con foco atrapado, Escape y retorno de foco.
- `prefers-reduced-motion`, zoom 200% y lector de pantalla.
- No depender de color, icono o video para comunicar estado.

## 8. Responsive

Validar 320, 375, 768, 1024 y 1440 px; portrait/landscape; touch targets ≥44 px.

- Header/sidebar y menú móvil.
- Hero, video, tarjetas, tablas, filtros y formularios.
- Modal de reserva/pago y dashboard psicólogo.
- Texto sin overflow horizontal, imágenes sin deformación y foco visible.

## 9. Regresión y salida

Cada P0/P1 debe tener caso reproducible, evidencia, impacto, severidad, responsable y retest. No aprobar con P0/P1 abiertos; P2 requiere aceptación explícita; P3 puede entrar a backlog.
