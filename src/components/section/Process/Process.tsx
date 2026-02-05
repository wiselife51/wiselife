import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Process.css';

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
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
    number: '01',
    title: 'Evalua disponibilidad',
    description: 'Revisa horarios disponibles para sesiones presenciales u online.',
    color: '#7e57c2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    number: '02',
    title: 'Agenda tu cita',
    description: 'Elige el horario que mejor se adapte a ti.',
    color: '#5c6bc0',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    number: '03',
    title: 'Primera sesion',
    description: 'Sesion de valoracion confidencial para conocer tu situacion.',
    color: '#42a5f5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    number: '04',
    title: 'Proceso terapeutico',
    description: 'Sesiones regulares con tecnicas de TCC para alcanzar tus metas.',
    color: '#26a69a',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

const Process: React.FC = () => {
  return (
    <section id="proceso" className="how-it-works-process-section">
      <div className="how-it-works-process-container">
        <div className="how-it-works-process-header">
          <span className="section-badge">Como Funciona</span>
          <h2 className="how-it-works-process-title">
            Tu camino hacia el <span className="how-it-works-process-title-gradient">bienestar</span>
          </h2>
          <p className="how-it-works-process-description">
            Un proceso simple y efectivo para comenzar tu terapia.
          </p>
        </div>

        <div className="carousel-wrapper-process">
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
              nextEl: '.swiper-button-next-process',
              prevEl: '.swiper-button-prev-process',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="process-swiper"
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
                <div className="process-card">
                  <div className="process-number">{step.number}</div>
                  
                  <div className="process-image-container">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="process-image"
                    />
                    <div className="process-image-overlay"></div>
                  </div>
                  
                  <div className="process-content">
                    <div className="process-icon">
                      {step.icon}
                    </div>
                    
                    <h3 className="process-title">{step.title}</h3>
                    <p className="process-description">{step.description}</p>

                    <button className="process-btn">
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
          <button className="swiper-button-prev-process">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-process">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Process;
