# Blueprint: Psicología Clínica Landing Page

## Overview

This document outlines the development plan and feature set for the "Psicología Clínica" landing page. The goal is to create a modern, visually appealing, and responsive one-page application to showcase the services of a clinical psychology practice.

## Project Outline

### Version 1.0 (Initial Implementation)

*   **Setup & Structure:**
    *   Initialized a React + Vite project.
    *   Established a standard project structure with `src/components`, `src/assets`, and `src/pages`.
*   **Core Components:**
    *   **Header:** A responsive header with a logo and navigation links.
    *   **Footer:** A footer with social media icons and copyright information.
    *   **Main Layout:** A main layout component to structure the page content.
*   **Sections:**
    *   **Hero:** A prominent hero section with a title, subtitle, and a call-to-action button.
    *   **Process:** A section explaining the therapy process with numbered steps.
    *   **How It Works:** A section detailing the methodology.
    *   **Specialists:** A carousel of specialists with their information.
    *   **Testimonials:** A carousel of client testimonials.
    *   **Pricing:** A section displaying different therapy plans.
*   **Styling & Design:**
    *   **Theme:** A dark theme with a gradient text effect for titles.
    *   **Typography:** Used the 'Inter' font for a clean and modern look.
    *   **Styling:** Used CSS with a modular approach for each component.
    *   **Responsive Design:** Implemented media queries to ensure the application is responsive on different screen sizes.
*   **Interactivity:**
    *   **Scroll Snapping:** Implemented full-page scroll snapping for a smooth, section-by-section navigation experience.
    *   **Carousels:** Implemented carousels for specialists and testimonials using Swiper.js.
    *   **Buttons:** Styled buttons with hover effects.
    *   **Social Media Icons:** Added social media icons with hover effects in the footer.
*   **Visual Enhancements:**
    *   **Card Design:** Implemented a consistent card design with blur effects and borders.
    *   **Animations:** Added subtle animations to sections and components.
*   **Recent Changes (Latest Updates):**
    *   **Scroll Snapping:** Implemented full-page scroll snapping for a smooth, section-by-section navigation experience.
    *   **Testimonial Card Height:** Adjusted the height of the testimonial cards to match the height of the specialist cards for better visual consistency.
    *   **Footer Social Icon Colors:** Added brand colors to the social media icons in the footer for improved visual appeal.

## Design System oficial WiseLife (v1.0)

La fuente de verdad UX/UI está documentada en:

*   [`docs/design-system.md`](docs/design-system.md): principios, tokens semánticos, tipografía, layout, componentes, iconografía, patrones por superficie, accesibilidad y migración legacy.
*   [`docs/design-tokens.css`](docs/design-tokens.css): referencia ejecutable de custom properties para modo claro y oscuro.
*   [`docs/component-inventory.md`](docs/component-inventory.md): inventario de componentes existentes, API objetivo y orden de adopción.

La dirección oficial reemplaza gradualmente los gradientes violetas y los colores hex locales por una base cálida de superficies, texto azul tinta y teal accesible. Esta entrega es documental: no modifica lógica de negocio, backend ni base de datos.

## Current Plan & Next Steps

*   Adoptar los tokens globales y migrar Button, Typography e Icon.
*   Normalizar navegación y formularios con los contratos accesibles del sistema.
*   Migrar superficies clínicas después de validar privacidad, responsive y contraste.
*   Mantener este blueprint sincronizado con las decisiones documentadas en `docs/`.
