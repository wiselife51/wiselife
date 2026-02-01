
import React from 'react';
import Typography from '../../components/Typography/Typography';
import Button from '../../components/Button/Button';
import Carousel from '../../components/Carousel/Carousel';
import Card from '../../components/Card/Card';
import './Hero.css';

const therapyCards = [
  {
    title: 'Mindfulness y Terapia Cognitiva',
    // CORRECCIÓN: Usar URL directa de la imagen
    imageUrl: 'https://storage.googleapis.com/gemini-studio-main-bucket/placeholder_1.jpg',
    description: 'Combina la meditación mindfulness con la terapia cognitiva para ayudarte a ser más consciente de tus pensamientos y a reducir el estrés y la ansiedad.',
  },
  {
    title: 'Terapia Cognitivo-Conductual (TCC)',
    // CORRECIÓN: Usar URL directa de la imagen
    imageUrl: 'https://storage.googleapis.com/gemini-studio-main-bucket/placeholder_2.jpg',
    description: 'La TCC te ayuda a identificar y cambiar patrones de pensamiento y comportamiento negativos. Es eficaz para la ansiedad, la depresión y el estrés.',
  },
  {
    title: 'Terapia de Aceptación y Compromiso (ACT)',
    // CORRECIÓN: Usar URL directa de la imagen
    imageUrl: 'https://storage.googleapis.com/gemini-studio-main-bucket/placeholder_3.jpg',
    description: 'La ACT te enseña a aceptar tus pensamientos y sentimientos en lugar de luchar contra ellos. Se centra en vivir el presente y actuar según tus valores.',
  },
];

const Hero: React.FC = () => {
  return (
    <section className="hero-container">
      <div className="hero-content">
        <Typography as="h1" variant="display" className="hero-title">
          Encuentra tu Bienestar Interior
        </Typography>
        <Typography as="p" variant="lead" className="hero-description">
          Explora una variedad de terapias diseñadas para ayudarte a navegar los desafíos de la vida y redescubrir tu equilibrio.
        </Typography>
        <Button href="#" variant="primary">
          Empieza tu Viaje
        </Button>
      </div>

      <div className="hero-carousel">
        <Carousel>
          {therapyCards.map((card, index) => (
            <Card key={index} title={card.title} imageUrl={card.imageUrl}>
              <Typography variant="body2">{card.description}</Typography>
            </Card>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Hero;
