import React from 'react';
import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Footer from '../../components/Footer/Footer';
import './Home.css';
import videoFondo from '../../assets/VideoFondo.mp4';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="home-video-background">
        <source src={videoFondo} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      <div className="home-content-overlay">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
