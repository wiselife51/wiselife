import React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';
import './Carousel.css';

const cardData = [
  {
    title: 'Intuitive Design',
    description: 'Experience a seamless and visually stunning interface, crafted for optimal user engagement and accessibility.'
  },
  {
    title: 'Powerful Features',
    description: 'Unlock a suite of advanced tools designed to boost your productivity and streamline your workflow effortlessly.'
  },
  {
    title: 'Secure & Reliable',
    description: 'Built on a robust and secure architecture, ensuring your data is always safe and the service is always available.'
  }
];

const duplicatedCardData = [...cardData, ...cardData];

const Carousel: React.FC = () => {
  const carouselVariants = {
    animate: {
      // --- CORRECCIÓN --- 
      // Animamos desde la posición inicial (0) hasta la mitad del track (-50%)
      x: ['0%', '-50%'], 
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 20, // Movimiento más lento para un efecto suave
          ease: 'linear'
        }
      }
    }
  };

  return (
    <div className="carousel-container">
      <motion.div
        className="carousel-track"
        variants={carouselVariants}
        animate="animate"
      >
        {/* Usamos el array duplicado para el bucle infinito */}
        {duplicatedCardData.map((card, index) => (
          <Card key={index} title={card.title} description={card.description} />
        ))}
      </motion.div>
    </div>
  );
};

export default Carousel;
