import { useState, useEffect } from 'react';
import {
  Home, LayoutTemplate, Settings as SettingsIcon, LogOut, Loader2
} from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import type { Area, Service } from './types';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { Settings } from './pages/Settings';
import { CreateAreaWizard } from './components/CreateAreaWizard';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { LandingPage } from './pages/LandingPage';

import { areaService } from './services/area.service';
import { serviceService } from './services/service.service';
import { BASE_URL } from './lib/api';
import { ThemeProvider, useTheme } from './components/theme-provider';
import { ThemeToggle } from './components/ThemeToggle';
import logo from './assets/logo.png';


function LanguageToggle() {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#11131A] text-gray-500 dark:text-gray-400 transition-colors font-bold text-sm"
      title={language === 'fr' ? 'Français' : 'English'}
    >
      {language === 'fr' ? 'FR' : 'EN'}
    </button>
  );
}

function AppContent() {
  const { setTheme } = useTheme();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | undefined>(undefined);
  const location = useLocation();

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (token) {
      // Fallback if only token exists (legacy)
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTheme('dark');
  };

  const handleUpdateUser = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [fetchedAreas, fetchedServices, fetchedConnections] = await Promise.all([
          areaService.getAll(),
          serviceService.getAll(),
          serviceService.getUserConnections(user.id)
        ]);
        setAreas(fetchedAreas);
        setServices(fetchedServices);
        setConnections(fetchedConnections);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Actions
  const toggleArea = async (area: Area) => {
    if (!user) return;
    try {
      const updateData = { is_active: !area.is_active };
      await areaService.update(area.id, updateData);
      // Optimistic update or refetch
      setAreas(prev => prev.map(a => a.id === area.id ? { ...a, ...updateData } : a));
    } catch (error) {
      console.error("Failed to toggle area:", error);
    }
  };

  const deleteArea = async (area: Area) => {
    if (!user) return;
    if (confirm('Supprimer ?')) {
      try {
        await areaService.delete(area.id);
        setAreas(prev => prev.filter(a => a.id !== area.id));
      } catch (error) {
        console.error("Failed to delete area:", error);
      }
    }
  };

  const toggleConnection = async (serviceSlug: string, status: boolean) => {
    if (!user) return;

    // Normalize logic for both connect and disconnect
    let slug = serviceSlug.toLowerCase();
    if (slug === 'gmail' || slug === 'mail' || slug === 'youtube') slug = 'google';

    if (status) {
      // Connect
      window.location.href = `${BASE_URL}/services/${slug}/connect?userId=${user.id}&redirect=web`;
    } else {
      // Disconnect
      try {
        await serviceService.disconnect(slug, user.id);
        setConnections(prev => ({ ...prev, [serviceSlug]: false }));
      } catch (error) {
        console.error("Failed to disconnect service:", error);
      }
    }
  };

  const runArea = async (area: Area) => {
    if (!user) return;
    try {
      // Step 6.1: Test (Force run)
      await areaService.test(area.id);
      // Ideally backend updates the status, we might need to refetch or simulate success
    } catch (error) {
      console.error("Failed to run area:", error);
    }
  };

  const openCreator = () => {
    setEditingArea(undefined);
    setIsCreatorOpen(true);
  };

  const openEditor = (area: Area) => {
    setEditingArea(area);
    setIsCreatorOpen(true);
  };

  if (loading) return <div className="bg-white dark:bg-[#020617] h-screen flex items-center justify-center text-gray-900 dark:text-white"><Loader2 className="animate-spin" /></div>;

  // Routes publiques
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage type="login" onLogin={handleLogin} />} />
        <Route path="/register" element={<AuthPage type="register" onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 dark:bg-gradient-to-br text-gray-900 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-300 relative">
      {/* Subtle vignette - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-100/20 dark:from-blue-500/10 dark:via-transparent dark:to-transparent pointer-events-none"></div>

      <aside className="hidden md:flex flex-col w-72 bg-white/10 dark:bg-blue-500/[0.02] backdrop-blur-xl bg-noise border-r border-blue-200/30 dark:border-blue-800/20 h-screen sticky top-0 p-6 transition-colors duration-300 z-50">
        <div className="flex items-center justify-between mb-10">
          <img src={logo} alt="AREA Logo" className="h-24 w-auto" />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { path: '/home', icon: Home, label: 'Home' },
            { path: '/services', icon: LayoutTemplate, label: 'Services' },
            { path: '/settings', icon: SettingsIcon, label: 'Réglages' }
          ].map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#11131A] hover:text-gray-900 dark:hover:text-white'}`}
            >
              <item.icon size={22} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-bold px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut size={20} /> Déconnexion
        </button>
      </aside>

      <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-5 md:p-10 space-y-8">
          <Routes>
            <Route path="/home" element={
              <Dashboard
                areas={areas}
                onToggleArea={toggleArea}
                onDeleteArea={deleteArea}
                onRunArea={runArea}
                onOpenCreator={openCreator}
                onEditArea={openEditor}
                services={services}
                user={user}
              />
            } />
            <Route path="/services" element={
              <Services
                connections={connections}
                onToggleConnection={toggleConnection}
                services={services}
                user={user}
              />
            } />
            <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-[#020617] border-t border-gray-200 dark:border-gray-800/50 flex justify-around py-2 pb-6 z-50 transition-colors duration-300">
        {[
          { path: '/home', icon: Home, label: 'Home' },
          { path: '/services', icon: LayoutTemplate, label: 'Services' },
          { path: '/settings', icon: SettingsIcon, label: 'Réglages' }
        ].map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl w-20 transition-colors ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-400'}`}
          >
            <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {isCreatorOpen && user && (
        <CreateAreaWizard
          onClose={() => setIsCreatorOpen(false)}
          initialArea={editingArea}
          onDelete={deleteArea}
          services={services}
          connections={connections}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}