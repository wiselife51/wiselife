import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Specialists.css';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color: string;
}

const services: Service[] = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Terapia Individual',
    description: 'Sesiones personalizadas enfocadas en tus necesidades específicas y bienestar emocional.',
    features: ['50 min', 'Seguimiento', 'Herramientas'],
    color: '#7e57c2',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Terapia de Pareja',
    description: 'Mejora la comunicación y fortalece el vínculo afectivo en tu relación.',
    features: ['60 min', 'Ambos', 'Plan conjunto'],
    color: '#5c6bc0',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Evaluación Psicológica',
    description: 'Valoración completa con herramientas diagnósticas profesionales.',
    features: ['Entrevista', 'Pruebas', 'Informe'],
    color: '#42a5f5',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    title: 'Terapia Cognitivo Conductual',
    description: 'Enfoque basado en evidencia científica para modificar patrones de pensamiento.',
    features: ['Comprobadas', 'Medibles', 'Práctico'],
    color: '#26a69a',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Intervención en Crisis',
    description: 'Atención inmediata y contención emocional en momentos críticos.',
    features: ['Rápida', 'Disponible', 'Efectiva'],
    color: '#ef5350',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Orientación Vocacional',
    description: 'Acompañamiento en decisiones sobre tu carrera y desarrollo profesional.',
    features: ['Test', 'Entrevistas', 'Plan'],
    color: '#ffa726',
  },
];

const Specialists: React.FC = () => {
  return (
    <section id="servicios" className="specialists-section">
      <div className="specialists-container">
        
        <div className="specialists-header">
          <h2 className="specialists-title">
            ¿En qué puedo <span className="specialists-title-gradient">ayudarte?</span>
          </h2>
          <p className="specialists-description">
            Ofrezco diversos servicios de psicología clínica con enfoque en TCC,
            tanto presencial en Bogotá como online.
          </p>
        </div>

        <div className="carousel-wrapper-specialists">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 1.5,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next-specialists',
              prevEl: '.swiper-button-prev-specialists',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="specialists-swiper"
            breakpoints={{
              320: {
                slidesPerView: 1,
                coverflowEffect: {
                  depth: 150,
                  modifier: 1,
                }
              },
              768: {
                slidesPerView: 'auto',
                coverflowEffect: {
                  depth: 200,
                  modifier: 1.5,
                }
              }
            }}
          >
            {services.map((service, index) => (
              <SwiperSlide key={index}>
                <div
                  className="service-card"
                  style={{ '--service-color': service.color } as React.CSSProperties}
                >
                  <div className="service-icon">{service.icon}</div>
                  
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>

                    <ul className="service-features">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="service-feature">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
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
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botones de navegación personalizados */}
          <button className="swiper-button-prev-specialists">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-specialists">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Specialists;
