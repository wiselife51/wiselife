
import React from 'react';
import { motion } from 'framer-motion';
import './Carousel.css';

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const carouselVariants = {
    animate: {
      x: ['0%', '-100%'], // Animamos sobre el ancho original
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 25, // Duración ajustada para el nuevo ancho
          ease: 'linear',
        },
      },
    },
  };

  // Duplicamos los children para crear el efecto de bucle infinito
  const duplicatedChildren = React.Children.toArray(children);

  return (
    <div className="carousel-container">
      <motion.div
        className="carousel-track"
        variants={carouselVariants}
        animate="animate"
      >
        {/* Renderizamos los hijos duplicados dos veces */} 
        {duplicatedChildren}
        {duplicatedChildren}
      </motion.div>
    </div>
  );
};

export default Carousel;

