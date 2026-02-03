import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Typography from '../../Typography/Typography';
import './Pricing.css';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Sesión Individual',
      price: '€60',
      period: 'por sesión de 50 min',
      features: [
        'Terapia personalizada uno a uno',
        'Flexibilidad de horarios',
        'Enfoque en tus metas personales',
        'Soporte por email entre sesiones'
      ],
      highlight: null,
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      name: 'Terapia de Pareja',
      price: '€90',
      period: 'por sesión de 80 min',
      features: [
        'Espacio seguro para ambos',
        'Mejora de la comunicación',
        'Resolución de conflictos',
        'Fortalecimiento del vínculo'
      ],
      highlight: 'Más Popular',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      name: 'Plan Mensual',
      price: '€220',
      period: '4 sesiones al mes',
      features: [
        'Ahorro en el costo por sesión',
        'Compromiso y constancia',
        'Prioridad en la agenda',
        'Seguimiento continuo del progreso'
      ],
      highlight: 'Mejor Valor',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    }
  ];

  return (
    <section className="pricing-section">
      <div className="pricing-container">
        
        <div className="pricing-header">
          <Typography 
            as="h2" 
            variant="heroTitle" 
            color="primary"
            className="pricing-title"
          >
            Invierte en Tu <span className="pricing-title-gradient">Bienestar</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="secondary"
            className="pricing-description"
          >
            Planes flexibles que se adaptan a tu camino de crecimiento personal 
            con opciones presenciales y online.
          </Typography>
        </div>

        <div className="carousel-wrapper-pricing">
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
              nextEl: '.swiper-button-next-pricing',
              prevEl: '.swiper-button-prev-pricing',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="pricing-swiper"
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
            {plans.map((plan, index) => (
              <SwiperSlide key={index}>
                <div className="pricing-card">
                  {plan.highlight && (
                    <div className="pricing-highlight">{plan.highlight}</div>
                  )}
                  
                  <div className="pricing-icon">
                    {plan.icon}
                  </div>
                  
                  <div className="pricing-content">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">{plan.price}</div>
                    <p className="plan-period">{plan.period}</p>
                    
                    <ul className="plan-features">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="plan-feature">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="pricing-btn">
                      <span>Seleccionar Plan</span>
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
          <button className="swiper-button-prev-pricing">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-pricing">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Pricing;