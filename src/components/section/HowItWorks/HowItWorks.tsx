import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Typography from '../../Typography/Typography';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <path d="M22 11l-3 3-2-2"/>
        </svg>
      ),
      title: 'Consulta Inicial Gratuita',
      description: 'Agenda una primera sesión sin costo para conocernos, discutir tus objetivos y resolver tus dudas.',
      features: ['Sin compromiso', 'Virtual o presencial', '30 min'],
      highlight: 'Gratis',
      step: '01'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      title: 'Plan Terapéutico Personalizado',
      description: 'Diseñamos un plan de terapia único enfocado en tus necesidades y metas específicas.',
      features: ['A tu medida', 'Objetivos claros', 'Flexible'],
      highlight: null,
      step: '02'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      title: 'Sesiones de Acompañamiento',
      description: 'Proporcionamos herramientas y apoyo continuo para tu proceso de sanación y crecimiento.',
      features: ['Seguimiento', 'Herramientas prácticas', 'Soporte constante'],
      highlight: null,
      step: '03'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      title: 'Bienestar y Autonomía',
      description: 'Desarrolla resiliencia y habilidades para gestionar tus emociones de forma autónoma y saludable.',
      features: ['Independencia', 'Herramientas de vida', 'Crecimiento'],
      highlight: 'Objetivo',
      step: '04'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        
        <div className="how-it-works-header">
          <Typography 
            as="h2" 
            variant="heroTitle" 
            color="primary"
            className="how-it-works-title"
          >
            Un Camino Claro Hacia Tu <span className="how-it-works-title-gradient">Bienestar</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="secondary"
            className="how-it-works-description"
          >
            Proceso terapéutico estructurado en 4 pasos fundamentales para 
            garantizar tu progreso y bienestar emocional.
          </Typography>
        </div>

        <div className="carousel-wrapper-howitworks">
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
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="steps-swiper"
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
            {steps.map((step, index) => (
              <SwiperSlide key={index}>
                <div className="step-card">
                  {step.highlight && (
                    <div className="step-highlight">{step.highlight}</div>
                  )}
                  
                  <div className="step-number">{step.step}</div>
                  
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                    
                    <ul className="step-features">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="step-feature">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="step-btn">
                      <span>Comenzar</span>
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

          {/* Botones de navegación personalizados - Estilo Specialists */}
          <button className="swiper-button-prev-custom">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-custom">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
