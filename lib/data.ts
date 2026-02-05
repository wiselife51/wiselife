// ============================================
// SERVICES DATA
// ============================================

export interface Service {
  id: string
  icon: "brain" | "heart" | "clipboard" | "message" | "phone" | "compass"
  title: string
  description: string
  features: string[]
  duration: string
}

export const services: Service[] = [
  {
    id: "terapia-individual",
    icon: "brain",
    title: "Terapia Individual",
    description: "Sesiones personalizadas enfocadas en tus necesidades especificas de salud mental.",
    features: ["Atencion personalizada", "Seguimiento continuo", "Herramientas practicas"],
    duration: "50 min",
  },
  {
    id: "terapia-pareja",
    icon: "heart",
    title: "Terapia de Pareja",
    description: "Mejora la comunicacion y fortalece el vinculo emocional en tu relacion.",
    features: ["Sesion conjunta", "Mediacion profesional", "Plan de accion"],
    duration: "80 min",
  },
  {
    id: "evaluacion-psicologica",
    icon: "clipboard",
    title: "Evaluacion Psicologica",
    description: "Valoracion completa con herramientas diagnosticas profesionales y certificadas.",
    features: ["Entrevista clinica", "Pruebas psicometricas", "Informe detallado"],
    duration: "90 min",
  },
  {
    id: "tcc",
    icon: "message",
    title: "Terapia Cognitivo Conductual",
    description: "Enfoque basado en evidencia cientifica para modificar patrones de pensamiento.",
    features: ["Tecnicas comprobadas", "Resultados medibles", "Enfoque practico"],
    duration: "50 min",
  },
  {
    id: "intervencion-crisis",
    icon: "phone",
    title: "Intervencion en Crisis",
    description: "Atencion inmediata y contencion emocional en momentos criticos de tu vida.",
    features: ["Respuesta rapida", "Disponibilidad extendida", "Apoyo efectivo"],
    duration: "Variable",
  },
  {
    id: "orientacion-vocacional",
    icon: "compass",
    title: "Orientacion Vocacional",
    description: "Acompanamiento en decisiones sobre tu carrera y desarrollo profesional.",
    features: ["Test vocacionales", "Analisis de perfil", "Plan de carrera"],
    duration: "60 min",
  },
]

// ============================================
// PRICING PLANS DATA
// ============================================

export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  highlight: string | null
  icon: "shield" | "user" | "users" | "calendar" | "clock" | "file"
  popular?: boolean
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "primera-consulta",
    name: "Primera Consulta",
    price: "Gratis",
    period: "30 minutos",
    features: ["Sin compromiso", "Conoce al terapeuta", "Define tus objetivos"],
    highlight: "Gratis",
    icon: "shield",
  },
  {
    id: "sesion-individual",
    name: "Sesion Individual",
    price: "$250.000",
    period: "por sesion de 50 min",
    features: ["Terapia personalizada", "Flexibilidad de horarios", "Soporte por email"],
    highlight: null,
    icon: "user",
  },
  {
    id: "terapia-pareja",
    name: "Terapia de Pareja",
    price: "$375.000",
    period: "por sesion de 80 min",
    features: ["Espacio seguro para ambos", "Resolucion de conflictos", "Fortalece el vinculo"],
    highlight: "Mas Popular",
    icon: "users",
    popular: true,
  },
  {
    id: "paquete-4-sesiones",
    name: "Paquete 4 Sesiones",
    price: "$920.000",
    period: "valido por 6 semanas",
    features: ["Ahorro del 8%", "Prioridad en la agenda", "Seguimiento continuo"],
    highlight: null,
    icon: "calendar",
  },
  {
    id: "plan-mensual",
    name: "Plan Mensual",
    price: "$850.000",
    period: "4 sesiones mensuales",
    features: ["Ahorro del 15%", "Compromiso y constancia", "Resultados mas rapidos"],
    highlight: "Mejor Valor",
    icon: "clock",
  },
  {
    id: "evaluacion-psicologica",
    name: "Evaluacion Psicologica",
    price: "$400.000",
    period: "incluye informe escrito",
    features: ["Entrevista clinica", "Pruebas psicometricas", "Informe detallado"],
    highlight: null,
    icon: "file",
  },
]

// ============================================
// TESTIMONIALS DATA
// ============================================

export interface Testimonial {
  id: string
  name: string
  role: string
  image: string
  rating: number
  text: string
}

export const testimonials: Testimonial[] = [
  {
    id: "maria-rodriguez",
    name: "Maria Rodriguez",
    role: "Paciente desde 2023",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    rating: 5,
    text: "La terapia me ayudo a superar mi ansiedad social. Ahora me siento mas segura y capaz de enfrentar situaciones que antes me paralizaban.",
  },
  {
    id: "carlos-mendoza",
    name: "Carlos Mendoza",
    role: "Paciente desde 2022",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    rating: 5,
    text: "Despues de anos luchando con depresion, finalmente encontre el apoyo profesional que necesitaba. Mi vida ha cambiado completamente.",
  },
  {
    id: "ana-martinez",
    name: "Ana Martinez",
    role: "Terapia de pareja 2024",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    rating: 5,
    text: "La terapia de pareja salvo nuestra relacion. Aprendimos a comunicarnos mejor y a entender las necesidades del otro.",
  },
  {
    id: "jorge-silva",
    name: "Jorge Silva",
    role: "Paciente desde 2023",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    rating: 5,
    text: "El proceso terapeutico me dio herramientas invaluables para manejar el estres laboral y mejorar mi calidad de vida.",
  },
  {
    id: "laura-gomez",
    name: "Laura Gomez",
    role: "Paciente desde 2024",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    rating: 5,
    text: "La orientacion vocacional me ayudo a tomar la mejor decision para mi futuro profesional. Estoy muy agradecida.",
  },
]

// ============================================
// HOW IT WORKS STEPS
// ============================================

export interface ProcessStep {
  id: string
  number: string
  title: string
  description: string
  icon: "user" | "file" | "message" | "heart" | "calendar" | "clock" | "check"
  image: string
}

export const howItWorksSteps: ProcessStep[] = [
  {
    id: "consulta-inicial",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    number: "01",
    title: "Consulta Inicial Gratuita",
    description: "Agenda una primera sesion sin costo para conocernos, discutir tus objetivos y resolver todas tus dudas.",
    icon: "user",
  },
  {
    id: "plan-personalizado",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    number: "02",
    title: "Plan Terapeutico Personalizado",
    description: "Disenamos un plan de terapia unico enfocado en tus necesidades, metas y tiempos especificos.",
    icon: "file",
  },
  {
    id: "sesiones-acompanamiento",
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80",
    number: "03",
    title: "Sesiones de Acompanamiento",
    description: "Proporcionamos herramientas y apoyo continuo para tu proceso de sanacion y crecimiento personal.",
    icon: "message",
  },
  {
    id: "bienestar-autonomia",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    number: "04",
    title: "Bienestar y Autonomia",
    description: "Desarrolla resiliencia y habilidades para gestionar tus emociones de forma autonoma y saludable.",
    icon: "heart",
  },
]

// ============================================
// APPOINTMENT PROCESS STEPS
// ============================================

export const appointmentSteps: ProcessStep[] = [
  {
    id: "evalua-disponibilidad",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80",
    number: "01",
    title: "Evalua Disponibilidad",
    description: "Revisa horarios disponibles en tiempo real para sesiones presenciales en Bogota u online.",
    icon: "clock",
  },
  {
    id: "agenda-cita",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    number: "02",
    title: "Agenda tu Cita",
    description: "Elige el horario que mejor se adapte a ti. Modalidad presencial en Bogota o virtual desde cualquier lugar.",
    icon: "calendar",
  },
  {
    id: "primera-sesion",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    number: "03",
    title: "Primera Sesion",
    description: "Sesion de valoracion confidencial donde conocere tu situacion actual y definiremos objetivos claros.",
    icon: "message",
  },
  {
    id: "plan-personalizado",
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80",
    number: "04",
    title: "Plan Personalizado",
    description: "Disenamos juntos un plan terapeutico con objetivos claros, medibles y alcanzables.",
    icon: "file",
  },
  {
    id: "proceso-terapeutico",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    number: "05",
    title: "Proceso Terapeutico",
    description: "Sesiones regulares con tecnicas de TCC para que alcances tus objetivos de bienestar emocional.",
    icon: "check",
  },
]

// ============================================
// NAVIGATION LINKS
// ============================================

export interface NavLink {
  href: string
  label: string
  icon: "layers" | "clock" | "dollar" | "message" | "users"
}

export const navLinks: NavLink[] = [
  { href: "#servicios", label: "Servicios", icon: "layers" },
  { href: "#proceso", label: "Proceso", icon: "clock" },
  { href: "#precios", label: "Precios", icon: "dollar" },
  { href: "#testimonios", label: "Testimonios", icon: "message" },
  { href: "#especialistas", label: "Especialistas", icon: "users" },
]

// ============================================
// SOCIAL LINKS
// ============================================

export interface SocialLink {
  id: string
  href: string
  label: string
  platform: "facebook" | "instagram" | "linkedin" | "tiktok" | "whatsapp" | "youtube" | "twitter"
}

export const socialLinks: SocialLink[] = [
  { id: "facebook", href: "https://facebook.com/vidasabia", label: "Facebook", platform: "facebook" },
  { id: "instagram", href: "https://instagram.com/vidasabia", label: "Instagram", platform: "instagram" },
  { id: "linkedin", href: "https://linkedin.com/in/stephanie-rincon", label: "LinkedIn", platform: "linkedin" },
  { id: "tiktok", href: "https://tiktok.com/@vidasabia", label: "TikTok", platform: "tiktok" },
  { id: "youtube", href: "https://youtube.com/@vidasabia", label: "YouTube", platform: "youtube" },
  { id: "whatsapp", href: "https://wa.me/573001234567", label: "WhatsApp", platform: "whatsapp" },
]

// ============================================
// FOOTER LINKS
// ============================================

export const footerQuickLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Como Funciona" },
  { href: "#precios", label: "Precios" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
]

export const footerServiceLinks = [
  { href: "#terapia-individual", label: "Terapia Individual" },
  { href: "#terapia-pareja", label: "Terapia de Pareja" },
  { href: "#evaluacion", label: "Evaluacion Psicologica" },
  { href: "#tcc", label: "Terapia Cognitivo Conductual" },
  { href: "#orientacion", label: "Orientacion Vocacional" },
]

export const footerLegalLinks = [
  { href: "/privacidad", label: "Politica de Privacidad" },
  { href: "/terminos", label: "Terminos y Condiciones" },
  { href: "/cookies", label: "Politica de Cookies" },
]

// ============================================
// CONTACT INFO
// ============================================

export const contactInfo = {
  address: "Bogota, Colombia",
  email: "contacto@vidasabia.com",
  phone: "+57 300 123 4567",
  schedule: "Lunes a Viernes: 8:00 AM - 7:00 PM",
}
