import { useState, useRef, useEffect } from 'react';
import './Process.css';
import Typography from '../../Typography/Typography';

const Process = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const steps = [
    {
      number: "01",
      title: "Evalúa disponibilidad",
      description: "Revisa horarios disponibles en tiempo real para sesiones presenciales u online.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    {
      number: "02",
      title: "Agenda tu cita",
      description: "Elige el horario que mejor se adapte a ti. Presencial en Bogotá o virtual.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      number: "03",
      title: "Primera sesión",
      description: "Sesión de valoración confidencial donde conoceré tu situación y objetivos.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      number: "04",
      title: "Plan personalizado",
      description: "Diseñamos juntos un plan terapéutico con objetivos claros y medibles.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )
    },
    {
      number: "05",
      title: "Proceso terapéutico",
      description: "Sesiones regulares con técnicas de TCC para alcanzar tus objetivos.",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    }
  ];

  // Duplicar para loop infinito
  const duplicatedSteps = [...steps, ...steps];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
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
    }, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="process-section">
      <div className="process-container">
        
        <div className="process-header">
          <Typography 
            as="h2" 
            variant="heroTitle" 
            color="primary"
            className="process-title"
          >
            ¿Cómo <span className="process-title-gradient">funciona?</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="secondary"
            className="process-description"
          >
            Un proceso simple y transparente para comenzar tu camino hacia el bienestar emocional.
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
            className="process-carousel" 
            onScroll={handleScroll}
          >
            {duplicatedSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="step-number">{step.number}</div>
                
                <div className="step-icon">
                  {step.icon}
                </div>

                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
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

        <div className="process-cta">
          <button className="process-cta-btn">
            <span>Comienza ahora</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Process;