import React from 'react';
import './App.css';
import Home from './pages/Home/Home';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <video autoPlay loop muted className="app-video-background">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
      <div className="app-content">
        <Home />
      </div>
    </div>
  );
};

export default App;