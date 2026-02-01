import React from 'react';
import Typography from '../Typography/Typography';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  const buttonClasses = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');

  // El color del texto depende de la variante del botón
  const textColor = variant === 'primary' ? 'dark' : 'primary';

  return (
    <button className={buttonClasses} {...props}>
      <Typography as="span" variant="caption" color={textColor}>
        {children}
      </Typography>
    </button>
  );
}

export default Button;
