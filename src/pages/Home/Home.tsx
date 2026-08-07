import React from 'react';
import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <SEO />
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="home-video-background"
      >
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
      <div className="home-content">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
