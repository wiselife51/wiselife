import React from 'react';
import './Main.css';
import Hero from '../section/Hero/Hero';
import Specialist from '../section/Specialists/Specialists';
import Psychologists from '../section/Psychologists/Psychologists';
import Testimonials from '../section/Testimonials/Testimonials';
import Process from '../section/Process/Process';
import HowItWorks from '../section/HowItWorks/HowItWorks';
import Pricing from '../section/Pricing/Pricing';
import Footer from '../section/Footer/Footer';

const Main: React.FC = () => {
  return (
    <main className="main-content">
      <Hero />
      <Specialist />
      <Psychologists />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Process />
      <Footer />
    </main>
  );
};

export default Main;
