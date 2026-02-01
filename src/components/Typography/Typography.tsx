import React from 'react';
import './Typography.css';

// Definimos los tipos para las props del componente
// Añadimos [key: string]: any; para permitir cualquier otra prop, como href
interface TypographyProps {
  as?: React.ElementType;
  variant: 'heroTitle' | 'heroSubtitle' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'dark';
  className?: string;
  children: React.ReactNode;
  [key: string]: any; // <-- LA CLAVE ESTÁ AQUÍ
}

const Typography: React.FC<TypographyProps> = ({
  as: Component = 'p',
  variant,
  color,
  className,
  children,
  ...props // 1. Recogemos todas las props extra (como href, onClick, etc.)
}) => {
  const classes = [
    'typography',
    `typography--variant-${variant}`,
    color ? `typography--color-${color}` : '',
    className
  ].filter(Boolean).join(' ');

  // 2. Las pasamos directamente al elemento que se renderiza (ej: <a href=... >)
  return <Component className={classes} {...props}>{children}</Component>;
}

export default Typography;
