import React from 'react';
import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="home-video-background">
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