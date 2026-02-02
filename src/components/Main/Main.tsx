import React from 'react';
import './Main.css';
import Hero from '../section/Hero/Hero';
import Specialist from '../section/Specialists/Specialists';
import Testimonials from '../section/Testimonials/Testimonials';
import Process from '../section/Process/Process';


const Main: React.FC = () => {
  return (
    <main className="main-content">
      <Hero />
      <Specialist />
      <Testimonials />
      <Process />
    </main>
  );
};

export default Main;