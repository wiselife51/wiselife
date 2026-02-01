
import React from 'react';
import Typography from '../Typography/Typography';
import './Card.css';

interface CardProps {
  title: string;
  imageUrl: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, imageUrl, children }) => {
  return (
    <div className="card">
      <div className="card-image-container">
        <img src={imageUrl} alt={title} className="card-image" />
      </div>
      <div className="card-content">
        <Typography as="h3" variant="cardTitle" className="card-title">
          {title}
        </Typography>
        <div className="card-description">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
