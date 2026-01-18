import { useTheme } from '../components/theme-provider';
import { useState, useEffect } from 'react';
import { Moon, Sun, Download, Smartphone, User, Lock, Mail, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';

import settingsImage from '../assets/reglage.png';
import settingsLight from '../assets/light/reglage.png';
import activityImage from '../assets/activité.png';
import activityLight from '../assets/light/activité.png';

interface SettingsProps {
    user?: any;
    onLogout?: () => void;
    onUpdateUser?: (user: any) => void;
}

export const Settings = ({ user, onLogout, onUpdateUser }: SettingsProps) => {
    const { theme, setTheme } = useTheme();
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

    // Profile Form State
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); // New password
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete Account State
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            setLanguage(localStorage.getItem('language') || 'fr');
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(handleStorageChange, 100);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const t = {
        title: language === 'fr' ? 'Réglages' : 'Settings',
        subtitle: language === 'fr' ? 'Paramètres de ton compte et de l\'application.' : 'Your account and application settings.',
        profile: language === 'fr' ? 'Profil' : 'Profile',
        updateProfile: language === 'fr' ? 'Mettre à jour le profil' : 'Update Profile',
        account: language === 'fr' ? 'Compte' : 'Account',
        logout: language === 'fr' ? 'Se déconnecter' : 'Sign out',
        deleteAccount: language === 'fr' ? 'Supprimer mon compte' : 'Delete my account',
        deleteConfirm: language === 'fr' ? 'Êtes-vous sûr ? Cette action est irréversible.' : 'Are you sure? This action cannot be undone.',
        appearance: language === 'fr' ? 'Apparence' : 'Appearance',
        theme: language === 'fr' ? 'Thème' : 'Theme',
        mobileApp: language === 'fr' ? 'Application Mobile' : 'Mobile App',
        mobileTitle: language === 'fr' ? 'Emporte AREA partout 📱' : 'Take AREA everywhere 📱',
        mobileDesc: language === 'fr' ? 'Automatise ta vie directement depuis ton smartphone Android' : 'Automate your life directly from your Android smartphone',
        download: language === 'fr' ? 'Télécharger pour Android' : 'Download for Android',
        compatibility: language === 'fr' ? 'Compatible Android 5.0 et supérieur • Gratuit' : 'Compatible Android 5.0 and above • Free',
        languageLabel: language === 'fr' ? 'Langue' : 'Language'
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const data: any = {
                data: { username: username }
            };
            if (email && email !== user?.email) data.email = email;
            if (password) data.password = password;

            const result = await authService.updateUser(data);
            if (onUpdateUser) onUpdateUser(result.user);
            alert("Profil mis à jour !");
            setPassword('');
        } catch (error: any) {
            alert("Erreur: " + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm(t.deleteConfirm)) return;
        setIsDeleting(true);
        try {
            await authService.deleteUser();
            if (onLogout) onLogout();
        } catch (error: any) {
            alert("Erreur: " + error.message);
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black mb-2 text-gray-900 dark:text-white">{t.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                </div>
                <img src={theme === 'light' ? settingsLight : settingsImage} alt="Settings" className="h-32 w-auto object-contain" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Section */}
                <div className="md:col-span-2 bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-300">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><User size={20} /> {t.profile}</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="Email" value={email} onChange={setEmail} icon={Mail} placeholder="email" labelClassName="text-gray-900 dark:text-gray-200" />
                            <Input label="Username" value={username} onChange={setUsername} icon={User} placeholder="username" labelClassName="text-gray-900 dark:text-gray-200" />
                        </div>
                        <Input label="Nouveau Mot de passe (laisser vide pour ne pas changer)" type="password" value={password} onChange={setPassword} icon={Lock} placeholder="•••••••" labelClassName="text-gray-900 dark:text-gray-200" />
                        <div className="flex justify-end">
                            <Button loading={isUpdating}>{t.updateProfile}</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-1 transition-colors duration-300">
                    <div className="px-4 py-2">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-200">{t.account}</h3>
                    </div>
                    {onLogout && (
                        <button onClick={onLogout} className="w-full text-left px-4 py-4 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors border-b border-gray-200 dark:border-gray-800/50">
                            {t.logout}
                        </button>
                    )}
                    <button disabled={isDeleting} onClick={handleDeleteAccount} className="w-full text-left px-4 py-4 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2">
                        <Trash2 size={18} /> {isDeleting ? '...' : t.deleteAccount}
                    </button>
                </div>

                {/* Appearance Section */}
                <div className="bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-1 transition-colors duration-300">
                    <div className="px-4 py-2">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-200">{t.appearance}</h3>
                    </div>
                    <div className="w-full px-4 py-4 flex justify-between items-center text-gray-900 dark:text-gray-400 font-medium border-t border-gray-200 dark:border-gray-800/50">
                        <span>{t.theme}</span>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <Sun size={18} />
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-[#020617] text-blue-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <Moon size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="w-full px-4 py-4 flex justify-between items-center text-gray-900 dark:text-gray-400 font-medium border-t border-gray-200 dark:border-gray-800/50">
                        <span>{t.languageLabel}</span>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => {
                                    setLanguage('fr');
                                    localStorage.setItem('language', 'fr');
                                }}
                                className={`px-3 py-2 rounded-md transition-all font-bold text-sm ${language === 'fr' ? 'bg-white dark:bg-[#020617] text-blue-600 dark:text-blue-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                FR
                            </button>
                            <button
                                onClick={() => {
                                    setLanguage('en');
                                    localStorage.setItem('language', 'en');
                                }}
                                className={`px-3 py-2 rounded-md transition-all font-bold text-sm ${language === 'en' ? 'bg-white dark:bg-[#020617] text-blue-600 dark:text-blue-500 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-blue-500/10 dark:from-blue-500/5 backdrop-blur-xl bg-noise border border-blue-300/30 dark:border-blue-800/30 rounded-2xl overflow-hidden p-6 transition-colors duration-300 flex items-center gap-6">
                    <img
                        src={theme === 'light' ? activityLight : activityImage}
                        alt="Mobile App"
                        className="w-48 h-auto object-contain hidden sm:block"
                    />
                    <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <Smartphone size={28} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{t.mobileTitle}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t.mobileDesc}</p>
                            </div>
                        </div>
                        <a
                            href="/client.apk"
                            download
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Download size={22} />
                            <span>{t.download}</span>
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">{t.compatibility}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
