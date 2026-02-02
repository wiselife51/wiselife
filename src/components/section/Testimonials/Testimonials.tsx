import { useState, useRef, useEffect } from 'react';
import './Testimonials.css';
import Typography from '../../Typography/Typography';

const Testimonials = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const testimonials = [
    {
      name: "María Rodríguez",
      role: "Paciente desde 2023",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      rating: 5,
      text: "La terapia me ayudó a superar mi ansiedad social. Ahora me siento más segura y capaz de enfrentar situaciones que antes me paralizaban. El enfoque profesional y empático marcó una gran diferencia."
    },
    {
      name: "Carlos Mendoza",
      role: "Paciente desde 2022",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      rating: 5,
      text: "Después de años luchando con depresión, finalmente encontré el apoyo que necesitaba. Las herramientas que aprendí en terapia cambiaron mi forma de ver los desafíos de la vida."
    },
    {
      name: "Ana Martínez",
      role: "Terapia de pareja 2024",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      rating: 5,
      text: "La terapia de pareja salvó nuestra relación. Aprendimos a comunicarnos mejor y a entender las necesidades del otro. Estamos más unidos que nunca."
    },
    {
      name: "Jorge Silva",
      role: "Paciente desde 2023",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      rating: 5,
      text: "El proceso terapéutico me dio las herramientas para manejar el estrés laboral. Ahora tengo un mejor equilibrio entre mi vida personal y profesional."
    },
    {
      name: "Laura Gómez",
      role: "Paciente desde 2024",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      rating: 5,
      text: "La orientación vocacional me ayudó a tomar la mejor decisión para mi futuro. Ahora estoy estudiando lo que realmente me apasiona y me siento realizada."
    }
  ];

  // Duplicar para loop infinito
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420;
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
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        
        <div className="testimonials-header">
          <Typography 
            as="h2" 
            variant="heroTitle" 
            color="primary"
            className="testimonials-title"
          >
            Lo que dicen <span className="testimonials-title-gradient">mis pacientes</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="secondary"
            className="testimonials-description"
          >
            Testimonios reales de personas que han transformado su vida a través de la terapia.
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
            className="testimonials-carousel" 
            onScroll={handleScroll}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="testimonial-image"
                  />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                </div>

                <div className="testimonial-rating">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                <p className="testimonial-text">"{testimonial.text}"</p>

                <div className="testimonial-quote-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.1">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
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

export default Testimonials;