import React from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import './Card.css';

// Definimos una interfaz para las propiedades que recibirá la tarjeta
interface CardProps {
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="card">
      <div className="card-content">
        <Typography as="h3" variant="h3" className="card-title">
          {title}
        </Typography>
        <Typography variant="body1" color="secondary" className="card-description">
          {description}
        </Typography>
        <Button variant="primary" className="card-button">
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default Card;
