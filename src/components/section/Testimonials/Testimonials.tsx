import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Testimonials.css';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Maria Rodriguez',
    role: 'Paciente desde 2023',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 5,
    text: 'La terapia me ayudo a superar mi ansiedad social. Me siento mas segura.',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Paciente desde 2022',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Despues de anos luchando con depresion, encontre el apoyo que necesitaba.',
  },
  {
    name: 'Ana Martinez',
    role: 'Terapia de pareja 2024',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 5,
    text: 'La terapia de pareja salvo nuestra relacion. Aprendimos a comunicarnos.',
  },
  {
    name: 'Jorge Silva',
    role: 'Paciente desde 2023',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 5,
    text: 'El proceso terapeutico me dio herramientas para manejar el estres.',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonios" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="section-badge">Testimonios</span>
          <h2 className="testimonials-title">
            Lo que dicen <span className="testimonials-title-gradient">mis pacientes</span>
          </h2>
          <p className="testimonials-description">
            Testimonios reales de personas que han transformado su vida.
          </p>
        </div>

        <div className="carousel-wrapper-testimonials">
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
              nextEl: '.swiper-button-next-testimonials',
              prevEl: '.swiper-button-prev-testimonials',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="testimonials-swiper"
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
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="testimonial-card">
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
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>

                  <p className="testimonial-text">"{testimonial.text}"</p>

                  <div className="testimonial-quote-icon">
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor" opacity="0.1">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botones de navegación personalizados */}
          <button className="swiper-button-prev-testimonials">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-testimonials">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
