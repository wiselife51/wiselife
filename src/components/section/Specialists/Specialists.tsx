import './Specialists.css';

const Specialists = () => {
  const specialists = [
    {
      title: 'Servicios de Terapia Psicológica Online',
      description: 'Un espacio seguro para hablar, sentir y sanar. Conecta con un terapeuta que te entienda, sin juicios.',
      image: 'https://images.pexels.com/photos/4098274/pexels-photo-4098274.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: 'Psicólogos online',
    },
    {
      title: 'Servicios de Coaching Emocional Online',
      description: 'Nuestro coaching te ayuda a tomar decisiones, alcanzar metas y diseñar la vida que mereces.',
      image: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: 'Coaching online',
    },
    {
      title: 'Servicios de Nutrición Online',
      description: 'Olvídate de las dietas extremas. Te guiamos para construir una relación sana con la comida.',
      image: 'https://images.pexels.com/photos/3864683/pexels-photo-3864683.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: 'Nutrición online',
    },
    {
      title: 'Servicios de Psiquiatría Online',
      description: 'Nuestros psiquiatras te acompañan con empatía, ciencia y sin estigmas.',
      image: 'https://images.pexels.com/photos/5452292/pexels-photo-5452292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: 'Psiquiatría online',
    },
  ];

  return (
    <section className="specialists-section">
      <h2>¿Qué tipo de especialista estás buscando?</h2>
      <div className="specialists-grid">
        {specialists.map((specialist, index) => (
          <div key={index} className="specialist-card">
            <h3>{specialist.title}</h3>
            <p>{specialist.description}</p>
            <img src={specialist.image} alt={specialist.title} />
            <a href="#" className="specialist-link">{specialist.link}</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Specialists;