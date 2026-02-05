import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './HowItWorks.css';

interface Step {
  image: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    number: '01',
    title: 'Consulta Inicial Gratuita',
    description: 'Agenda una primera sesion sin costo para conocernos y resolver tus dudas.',
    color: '#7e57c2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M22 11l-3 3-2-2" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    number: '02',
    title: 'Plan Personalizado',
    description: 'Disenamos un plan de terapia enfocado en tus necesidades especificas.',
    color: '#5c6bc0',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80',
    number: '03',
    title: 'Acompanamiento',
    description: 'Herramientas y apoyo continuo para tu proceso de crecimiento.',
    color: '#42a5f5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    number: '04',
    title: 'Bienestar y Autonomia',
    description: 'Desarrolla resiliencia para gestionar tus emociones de forma saludable.',
    color: '#26a69a',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="servicios" className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <span className="section-badge">Tu Proceso</span>
          <h2 className="how-it-works-title">
            Un camino claro hacia tu <span className="how-it-works-title-gradient">Bienestar</span>
          </h2>
          <p className="how-it-works-description">
            Proceso terapeutico estructurado en 4 pasos fundamentales para garantizar tu progreso.
          </p>
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
              nextEl: '.swiper-button-next-howitworks',
              prevEl: '.swiper-button-prev-howitworks',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="howitworks-swiper"
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
                <div className="howitworks-card">
                  <div className="howitworks-number">{step.number}</div>
                  
                  <div className="howitworks-image-container">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="howitworks-image"
                    />
                    <div className="howitworks-image-overlay"></div>
                  </div>
                  
                  <div className="howitworks-content">
                    <div className="howitworks-icon">
                      {step.icon}
                    </div>
                    
                    <h3 className="howitworks-title">{step.title}</h3>
                    <p className="howitworks-description">{step.description}</p>

                    <button className="howitworks-btn">
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

          {/* Botones de navegación personalizados */}
          <button className="swiper-button-prev-howitworks">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-howitworks">
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
