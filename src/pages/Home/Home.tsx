import React from 'react';
import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content-overlay">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default Home;