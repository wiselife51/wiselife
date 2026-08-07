# Componentes y pantallas

## Convenciones

Los componentes visuales reciben props y eventos; las reglas de autorización y persistencia deben permanecer fuera de la presentación. Las acciones icon-only requieren `aria-label`; los formularios deben asociar labels, errores y descripciones.

## Componentes compartidos

| Área | Componentes |
|---|---|
| Navegación | `Header`, `Sidebar`, `DashboardLayout`, `Footer` |
| Presentación | `Button`, `Typography`, `Icon`, `Main` |
| Clínico | `ClinicalHistoryView`, `ClinicalRecordModal`, `SessionNoteModal` |
| Landing | `Hero`, `HowItWorks`, `Pricing`, `Process`, `Psychologists`, `Specialists`, `Testimonials` |

Cada componente tiene su carpeta y, en la mayoría de casos, una hoja CSS asociada. El inventario normativo ampliado está en `../component-inventory.md`.

## Páginas

- `Home`: superficie pública y secciones de producto.
- `Login` y `PsychologistLogin`: acceso según perfil.
- `AuthCallback`: resolución del callback de autenticación.
- `Onboarding`, `MotivationSurvey` y `ReferralSurvey`: captura inicial y evaluaciones.
- `Dashboard`, `Profile`, `Specialists`, `SpecialistProfile` y `MisCitas`: experiencia del paciente.
- `PsychologistOnboarding` y `PsychologistDashboard`: experiencia profesional.

## Responsabilidades

- **Layouts:** landmarks, navegación, responsive y composición.
- **Formularios:** captura, validación visual, estados de carga y error.
- **Modales clínicos:** foco atrapado, retorno de foco, privacidad y cierre explícito.
- **Dashboards:** presentación de datos autorizados; no deben asumir que ocultar un control equivale a autorización.

## Accesibilidad y privacidad

Usar HTML semántico, navegación por teclado, foco visible, contraste suficiente y mensajes de error asociados. No renderizar información clínica en superficies públicas, no enviar contenido clínico a telemetría y limpiar estados sensibles al cerrar sesión.

## Diseño

Los tokens y el sistema visual existentes están en `../design-tokens.css` y `../design-system.md`. El inventario existente define la adopción objetivo; los componentes descritos aquí son los localizados en el repositorio, no una promesa de APIs futuras.

## Pendientes

Normalizar primitives, separar componentes por feature, añadir estados de carga/error consistentes y crear pruebas de interacción para formularios, overlays y navegación.
