import React from 'react';
import Typography from '../Typography/Typography';
import Carousel from '../Carousel/Carousel'; // <-- AÑADIDO: Importamos el carrusel
import './Main.css';

const Main: React.FC = () => {
  return (
    <main className="main">
      <div className="main__content">
        <Typography as="h1" variant="h1" color="primary" className="main__title">
          Welcome to Wiselife
        </Typography>
        <Typography variant="body1" color="secondary" className="main__subtitle">
          Discover a new way of living, powered by cutting-edge technology and intuitive design.
        </Typography>

        {/* --- Carrusel de Tarjetas --- */}
        <Carousel />
      </div>
    </main>
  );
}

export default Main;
