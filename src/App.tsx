import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Onboarding from './pages/Onboarding/Onboarding';
import ReferralSurvey from './pages/ReferralSurvey/ReferralSurvey';
import MotivationSurvey from './pages/MotivationSurvey/MotivationSurvey';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import PsychologistLogin from './pages/PsychologistLogin/PsychologistLogin';
import PsychologistOnboarding from './pages/PsychologistOnboarding/PsychologistOnboarding';
import PsychologistDashboard from './pages/PsychologistDashboard/PsychologistDashboard';
import AgendarSesion from './pages/AgendarSesion/AgendarSesion';
import MisCitas from './pages/MisCitas/MisCitas';
import Pendientes from './pages/Pendientes/Pendientes';
import Admin from './pages/Admin/Admin';

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
            <Route path="/mi-perfil" element={<Profile />} />
            <Route path="/agendar-sesion" element={<AgendarSesion />} />
            <Route path="/especialistas" element={<Navigate to="/agendar-sesion" replace />} />
            <Route path="/especialista/:id" element={<Navigate to="/agendar-sesion" replace />} />
            <Route path="/mis-citas" element={<MisCitas />} />
            <Route path="/pendientes" element={<Pendientes />} />
            <Route path="/psicologo/login" element={<PsychologistLogin />} />
            <Route path="/psicologo/onboarding" element={<PsychologistOnboarding />} />
            <Route path="/psicologo/dashboard" element={<PsychologistDashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
