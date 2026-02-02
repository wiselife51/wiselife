import { useState, useRef, useEffect } from 'react';
import './Specialists.css';
import Typography from '../../Typography/Typography';

const Specialists = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const services = [
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      title: "Terapia Individual",
      description: "Sesiones personalizadas enfocadas en tus necesidades específicas.",
      features: ["50 min", "Seguimiento", "Herramientas"],
      highlight: "Popular"
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: "Terapia de Pareja",
      description: "Mejora la comunicación y fortalece el vínculo en tu relación.",
      features: ["60 min", "Ambos", "Plan conjunto"],
      highlight: null
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: "Evaluación Psicológica",
      description: "Valoración completa con herramientas diagnósticas profesionales.",
      features: ["Entrevista", "Pruebas", "Informe"],
      highlight: null
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: "Terapia Cognitivo Conductual",
      description: "Enfoque basado en evidencia científica para modificar patrones.",
      features: ["Comprobadas", "Medibles", "Práctico"],
      highlight: "Especialidad"
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      title: "Intervención en Crisis",
      description: "Atención inmediata y contención emocional en momentos críticos.",
      features: ["Rápida", "Disponible", "Efectiva"],
      highlight: null
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      title: "Orientación Vocacional",
      description: "Acompañamiento en decisiones sobre tu carrera profesional.",
      features: ["Test", "Entrevistas", "Plan"],
      highlight: null
    }
  ];

  // Duplicar servicios para loop infinito
  const duplicatedServices = [...services, ...services];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const halfScroll = scrollWidth / 2;

      // Loop infinito
      if (scrollLeft >= halfScroll - 10) {
        scrollContainerRef.current.scrollLeft = 10;
      } else if (scrollLeft <= 10) {
        scrollContainerRef.current.scrollLeft = halfScroll - 10;
      }

      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    }
  };

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="specialists-section">
      <div className="specialists-container">
        
        <div className="specialists-header">
          <Typography 
            as="h2" 
            variant="heroTitle" 
            color="primary"
            className="specialists-title"
          >
            ¿En qué puedo <span className="specialists-title-gradient">ayudarte?</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="secondary"
            className="specialists-description"
          >
            Ofrezco diversos servicios de psicología clínica con enfoque en TCC, 
            tanto presencial en Bogotá como online.
          </Typography>
        </div>

        <div className="carousel-wrapper">
          {canScrollLeft && (
            <button className="carousel-btn carousel-btn-left" onClick={() => scroll('left')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            className="services-carousel" 
            onScroll={handleScroll}
          >
            {duplicatedServices.map((service, index) => (
              <div key={index} className="service-card">
                {service.highlight && (
                  <div className="service-highlight">{service.highlight}</div>
                )}
                
                <div className="service-icon">
                  {service.icon}
                </div>
                
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  
                  <ul className="service-features">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="service-feature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="service-btn">
                    <span>Agendar</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button className="carousel-btn carousel-btn-right" onClick={() => scroll('right')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
        </div>

      </div>
    </section>
  );
};

export default Specialists;