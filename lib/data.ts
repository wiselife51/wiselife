// Services/Specialists Data
export const services = [
  {
    icon: "plus",
    title: "Terapia Individual",
    description: "Sesiones personalizadas enfocadas en tus necesidades especificas.",
    features: ["50 min", "Seguimiento", "Herramientas"],
  },
  {
    icon: "users",
    title: "Terapia de Pareja",
    description: "Mejora la comunicacion y fortalece el vinculo en tu relacion.",
    features: ["60 min", "Ambos", "Plan conjunto"],
  },
  {
    icon: "grid",
    title: "Evaluacion Psicologica",
    description: "Valoracion completa con herramientas diagnosticas profesionales.",
    features: ["Entrevista", "Pruebas", "Informe"],
  },
  {
    icon: "message",
    title: "Terapia Cognitivo Conductual",
    description: "Enfoque basado en evidencia cientifica para modificar patrones.",
    features: ["Comprobadas", "Medibles", "Practico"],
  },
  {
    icon: "phone",
    title: "Intervencion en Crisis",
    description: "Atencion inmediata y contencion emocional en momentos criticos.",
    features: ["Rapida", "Disponible", "Efectiva"],
  },
  {
    icon: "help",
    title: "Orientacion Vocacional",
    description: "Acompanamiento en decisiones sobre tu carrera profesional.",
    features: ["Test", "Entrevistas", "Plan"],
  },
]

// Pricing Plans Data
export const plans = [
  {
    name: "Primera Consulta",
    price: "Gratis",
    period: "30 minutos",
    features: ["Sin compromiso", "Conoce al terapeuta", "Define tus objetivos"],
    highlight: "Gratis",
    icon: "shield",
  },
  {
    name: "Sesion Individual",
    price: "$250.000",
    period: "por sesion de 50 min",
    features: ["Terapia personalizada", "Flexibilidad de horarios", "Soporte por email"],
    highlight: null,
    icon: "user",
  },
  {
    name: "Terapia de Pareja",
    price: "$375.000",
    period: "por sesion de 80 min",
    features: ["Espacio seguro para ambos", "Resolucion de conflictos", "Fortalece el vinculo"],
    highlight: "Mas Popular",
    icon: "users",
  },
  {
    name: "Paquete 4 Sesiones",
    price: "$920.000",
    period: "valido por 6 semanas",
    features: ["Ahorro del 8%", "Prioridad en la agenda", "Seguimiento continuo"],
    highlight: null,
    icon: "calendar",
  },
  {
    name: "Plan Mensual",
    price: "$850.000",
    period: "4 sesiones mensuales",
    features: ["Ahorro del 15%", "Compromiso y constancia", "Resultados mas rapidos"],
    highlight: "Mejor Valor",
    icon: "clock",
  },
  {
    name: "Evaluacion Psicologica",
    price: "$400.000",
    period: "incluye informe escrito",
    features: ["Entrevista clinica", "Pruebas psicometricas", "Informe detallado"],
    highlight: null,
    icon: "file",
  },
]

// Testimonials Data
export const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Paciente desde 2023",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    rating: 5,
    text: "La terapia me ayudo a superar mi ansiedad social. Ahora me siento mas segura y capaz de enfrentar situaciones.",
  },
  {
    name: "Carlos Mendoza",
    role: "Paciente desde 2022",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    rating: 5,
    text: "Despues de anos luchando con depresion, finalmente encontre el apoyo que necesitaba.",
  },
  {
    name: "Ana Martinez",
    role: "Terapia de pareja 2024",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    rating: 5,
    text: "La terapia de pareja salvo nuestra relacion. Aprendimos a comunicarnos mejor.",
  },
  {
    name: "Jorge Silva",
    role: "Paciente desde 2023",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    rating: 5,
    text: "El proceso terapeutico me dio herramientas para manejar el estres laboral.",
  },
  {
    name: "Laura Gomez",
    role: "Paciente desde 2024",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    rating: 5,
    text: "La orientacion vocacional me ayudo a tomar la mejor decision para mi futuro.",
  },
]

// How It Works Steps
export const howItWorksSteps = [
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    number: "01",
    title: "Consulta Inicial Gratuita",
    description: "Agenda una primera sesion sin costo para conocernos, discutir tus objetivos y resolver tus dudas.",
    icon: "user",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    number: "02",
    title: "Plan Terapeutico Personalizado",
    description: "Disenamos un plan de terapia unico enfocado en tus necesidades y metas especificas.",
    icon: "file",
  },
  {
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80",
    number: "03",
    title: "Sesiones de Acompanamiento",
    description: "Proporcionamos herramientas y apoyo continuo para tu proceso de sanacion y crecimiento.",
    icon: "message",
  },
  {
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    number: "04",
    title: "Bienestar y Autonomia",
    description: "Desarrolla resiliencia y habilidades para gestionar tus emociones de forma autonoma y saludable.",
    icon: "heartpulse",
  },
]

// Process Steps
export const processSteps = [
  {
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80",
    number: "01",
    title: "Evalua disponibilidad",
    description: "Revisa horarios disponibles en tiempo real para sesiones presenciales u online.",
    icon: "clock",
  },
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    number: "02",
    title: "Agenda tu cita",
    description: "Elige el horario que mejor se adapte a ti. Presencial en Bogota o virtual.",
    icon: "calendar",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    number: "03",
    title: "Primera sesion",
    description: "Sesion de valoracion confidencial donde conocere tu situacion y objetivos.",
    icon: "message",
  },
  {
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80",
    number: "04",
    title: "Plan personalizado",
    description: "Disenamos juntos un plan terapeutico con objetivos claros y medibles.",
    icon: "file",
  },
  {
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    number: "05",
    title: "Proceso terapeutico",
    description: "Sesiones regulares con tecnicas de TCC para alcanzar tus objetivos.",
    icon: "check",
  },
]
