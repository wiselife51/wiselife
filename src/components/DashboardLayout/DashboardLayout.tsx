import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../Sidebar/Sidebar';
import { DashboardModuleHeader } from '../../pages/PsychologistDashboard/components/DashboardModuleHeader';
import '../../pages/PsychologistDashboard/PsychologistDashboard.css';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  subtitle?: string;
  count?: number;
  action?: React.ReactNode;
}

interface LayoutProfile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle, subtitle, count, action }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<LayoutProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const fullName = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Usuario';
  const email = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="psy-dash">
      <video className="psy-dash-video" autoPlay loop muted playsInline aria-hidden="true">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="psy-dash-video-overlay" aria-hidden="true" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{ fullName, email, avatarUrl }}
      />

      <main className="psy-dash-main psy-dash-main--flush">
        <section className="psy-alert-page pt-page">
          <DashboardModuleHeader
            title={pageTitle}
            subtitle={subtitle}
            count={count}
            action={action}
            onMenu={() => setSidebarOpen((open) => !open)}
            menuOpen={sidebarOpen}
          />
          <div className="pt-scroll">{children}</div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
