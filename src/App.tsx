import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Onboarding from './pages/Onboarding/Onboarding';
import ReferralSurvey from './pages/ReferralSurvey/ReferralSurvey';
import MotivationSurvey from './pages/MotivationSurvey/MotivationSurvey';
import Dashboard from './pages/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/referral-survey" element={<ReferralSurvey />} />
            <Route path="/motivation-survey" element={<MotivationSurvey />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
