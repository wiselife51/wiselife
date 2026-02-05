import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Psychologists.css';

interface Psychologist {
  name: string;
  title: string;
  specialty: string;
  image: string;
  experience: string;
  rating: number;
  sessions: string;
  tags: string[];
}

const psychologists: Psychologist[] = [
  {
    name: 'Dra. Carolina Mendez',
    title: 'Psicologa Clinica',
    specialty: 'Ansiedad y Depresion',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    experience: '12 anos',
    rating: 4.9,
    sessions: '+2,500',
    tags: ['Adultos', 'TCC', 'Mindfulness'],
  },
  {
    name: 'Dr. Andres Ramirez',
    title: 'Psicologo Especialista',
    specialty: 'Terapia de Pareja',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    experience: '15 anos',
    rating: 4.8,
    sessions: '+3,200',
    tags: ['Parejas', 'Familia', 'Comunicacion'],
  },
  {
    name: 'Dra. Valentina Torres',
    title: 'Neuropsicologia',
    specialty: 'TDAH y Neurodesarrollo',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    experience: '8 anos',
    rating: 4.9,
    sessions: '+1,800',
    tags: ['Ninos', 'Adolescentes', 'TDAH'],
  },
  {
    name: 'Dr. Sebastian Herrera',
    title: 'Psicologo Clinico',
    specialty: 'Trauma y TEPT',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    experience: '10 anos',
    rating: 4.7,
    sessions: '+2,100',
    tags: ['Trauma', 'EMDR', 'Crisis'],
  },
  {
    name: 'Dra. Isabella Castro',
    title: 'Psicologa Infantil',
    specialty: 'Desarrollo Emocional',
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop',
    experience: '9 anos',
    rating: 5.0,
    sessions: '+1,600',
    tags: ['Ninos', 'Juego', 'Emociones'],
  },
];

const Psychologists: React.FC = () => {
  return (
    <section id="especialistas" className="psychologists-section">
      <div className="psychologists-container">
        <div className="psychologists-header">
          <div className="psychologists-badge psychologists-badge--mobile">
            <span className="psychologists-badge-dot" />
            <span>Nuestro Equipo</span>
          </div>
          <h2 className="psychologists-title">
            Conoce a nuestros <span className="psychologists-title-gradient">Especialistas</span>
          </h2>
          <p className="psychologists-description">
            Profesionales certificados comprometidos con tu bienestar emocional.
          </p>
        </div>

        <div className="carousel-wrapper-psychologists">
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
              nextEl: '.swiper-button-next-psychologists',
              prevEl: '.swiper-button-prev-psychologists',
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className="psychologists-swiper"
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
            {psychologists.map((psychologist, index) => (
              <SwiperSlide key={index}>
                <div className="psychologist-card">
                  <div className="psychologist-image-container">
                    <img 
                      src={psychologist.image} 
                      alt={psychologist.name}
                      className="psychologist-image"
                    />
                    <div className="psychologist-image-overlay" />
                    <div className="psychologist-rating">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>{psychologist.rating}</span>
                    </div>
                  </div>
                  
                  <div className="psychologist-content">
                    <h3 className="psychologist-name">{psychologist.name}</h3>
                    <p className="psychologist-title">{psychologist.title}</p>
                    <p className="psychologist-specialty">{psychologist.specialty}</p>
                    
                    <div className="psychologist-stats">
                      <div className="psychologist-stat">
                        <span className="stat-value">{psychologist.experience}</span>
                        <span className="stat-label">Experiencia</span>
                      </div>
                      <div className="psychologist-stat">
                        <span className="stat-value">{psychologist.sessions}</span>
                        <span className="stat-label">Sesiones</span>
                      </div>
                    </div>
                    
                    <div className="psychologist-tags">
                      {psychologist.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="psychologist-tag">{tag}</span>
                      ))}
                    </div>

                    <button className="psychologist-btn">
                      <span>Ver Perfil</span>
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

          <button className="swiper-button-prev-psychologists">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="swiper-button-next-psychologists">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Psychologists;
