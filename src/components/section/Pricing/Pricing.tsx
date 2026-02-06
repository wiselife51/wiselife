import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Pricing.css';

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight: string | null;
  icon: React.ReactNode;
  color: string;
}

const plans: Plan[] = [
  {
    name: 'Primera Consulta',
    price: 'Gratis',
    period: '30 minutos',
    features: ['Sin compromiso', 'Conoce al terapeuta', 'Define objetivos'],
    highlight: 'Gratis',
    color: '#26a69a',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: 'Sesion Individual',
    price: '$250.000',
    period: 'por sesion de 50 min',
    features: ['Terapia personalizada', 'Flexibilidad horarios', 'Soporte email'],
    highlight: null,
    color: '#5c6bc0',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    name: 'Terapia de Pareja',
    price: '$375.000',
    period: 'por sesion de 80 min',
    features: ['Espacio seguro', 'Resolucion conflictos', 'Fortalece vinculo'],
    highlight: 'Mas Popular',
    color: '#7e57c2',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: 'Plan Mensual',
    price: '$850.000',
    period: '4 sesiones mensuales',
    features: ['Ahorro del 15%', 'Compromiso continuo', 'Resultados rapidos'],
    highlight: 'Mejor Valor',
    color: '#42a5f5',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="precios" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <div className="pricing-badge pricing-badge--mobile">
            <span className="pricing-badge-dot" />
            <span>Precios</span>
          </div>
          <h2 className="pricing-title">
            Invierte en tu <span className="pricing-title-gradient">Bienestar</span>
          </h2>
          <p className="pricing-description">
            Planes flexibles que se adaptan a tu camino de crecimiento personal.
          </p>
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
                coverflowEffect: { depth: 150, modifier: 1 }
              },
              768: {
                slidesPerView: 'auto',
                coverflowEffect: { depth: 200, modifier: 1.5 }
              }
            }}
          >
            {plans.map((plan, index) => (
              <SwiperSlide key={index}>
                <div
                  className="pricing-card"
                  style={{ '--plan-color': plan.color } as React.CSSProperties}
                >
                  {plan.highlight && (
                    <div className="pricing-highlight">{plan.highlight}</div>
                  )}

                  <div className="pricing-icon">{plan.icon}</div>

                  <div className="pricing-content">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">{plan.price}</div>
                    <p className="plan-period">{plan.period}</p>

                    <ul className="plan-features">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="plan-feature">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                            <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2.5" fill="none" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="pricing-btn">
                      <span>Seleccionar</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="swiper-button-prev-pricing">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="swiper-button-next-pricing">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
