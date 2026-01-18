import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Facebook, Twitter, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';
import { ThemeToggle } from '../components/ThemeToggle';

import logo from '../assets/logo.png';
import firstImage from '../assets/first.png';
import shape9 from '../assets/formes/9.png';
import shape10 from '../assets/formes/10.png';
import shape11 from '../assets/formes/11.png';
import shape12 from '../assets/formes/12.png';

export const AuthPage = ({ type, onLogin }: { type: 'login' | 'register', onLogin: (user: any, token: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (type === 'register') {
            if (password !== confirmPassword) {
                setError("Les mots de passe ne correspondent pas.");
                setLoading(false);
                return;
            }
            if (!username) {
                setError("Le nom d'utilisateur est requis.");
                setLoading(false);
                return;
            }
        }

        try {
            let response;
            if (type === 'login') {
                response = await authService.login(email, password);
            } else {
                response = await authService.register(email, password, username);
            }

            if (response.token) {
                onLogin(response.user, response.token);
            } else {
                setError('Authentication successful but no token received');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (_providerName: 'google' | 'facebook' | 'twitter') => {
        alert("Social login is not yet supported by the backend API.");
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <img src={logo} alt="AREA Logo" className="h-32 w-auto transition-all duration-300" />
                    </div>
                    <p className="text-gray-400">{type === 'login' ? 'Bon retour parmi nous !' : 'Créez votre compte gratuitement'}</p>
                </div>

                <div className="bg-white/70 dark:bg-[#11131A] backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 p-8 rounded-2xl space-y-6 shadow-xl shadow-blue-900/10 transition-colors duration-300">
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 bg-[#1C1E26] hover:bg-[#252836] text-white py-2.5 rounded-xl border border-gray-800 transition-all font-bold text-sm">
                            <span className="text-lg font-bold text-red-500">G</span>
                        </button>
                        <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 bg-[#1C1E26] hover:bg-[#252836] text-white py-2.5 rounded-xl border border-gray-800 transition-all font-bold text-sm">
                            <Facebook size={18} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleSocialLogin('twitter')} className="flex items-center justify-center gap-2 bg-[#1C1E26] hover:bg-[#252836] text-white py-2.5 rounded-xl border border-gray-800 transition-all font-bold text-sm">
                            <Twitter size={18} className="text-sky-500" />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/50 dark:bg-[#11131A] px-2 text-gray-500 font-bold">Ou avec email</span></div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {type === 'register' && (
                            <Input label="Nom d'utilisateur" type="text" value={username} onChange={setUsername} placeholder="Pseudo" icon={User} labelClassName="text-gray-900 dark:text-gray-200" />
                        )}
                        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="exemple@email.com" icon={Mail} labelClassName="text-gray-900 dark:text-gray-200" />
                        <div className="space-y-1">
                            <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon={Lock} labelClassName="text-gray-900 dark:text-gray-200" />
                            {type === 'register' && (
                                <p className="text-xs text-gray-500 px-1">
                                    Min 8 car., 1 lettre, 1 chiffre, 1 caractère spécial (@$!%*?&)
                                </p>
                            )}
                        </div>
                        {type === 'login' && (
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        )}
                        {type === 'register' && (
                            <Input label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" icon={Lock} labelClassName="text-gray-900 dark:text-gray-200" />
                        )}

                        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}

                        <Button fullWidth loading={loading} icon={ArrowRight}>
                            {type === 'login' ? 'Se connecter' : "S'inscrire"}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm">
                    {type === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <Link to={type === 'login' ? '/register' : '/login'} className="text-blue-500 font-bold hover:underline ml-1">
                        {type === 'login' ? "S'inscrire" : "Se connecter"}
                    </Link>
                </p>
            </div >
            <img src={firstImage} alt="Decoration" className="absolute bottom-0 right-0 w-1/3 max-w-md opacity-80 pointer-events-none" />

            {/* Decorative Shapes */}
            {/* Decorative Shapes */}
            <img src={shape9} alt="" className="absolute top-0 left-0 w-96 opacity-100 pointer-events-none dark:mix-blend-screen mix-blend-multiply brightness-0 dark:brightness-100 animate-float" />
            <img src={shape10} alt="" className="absolute top-20 right-20 w-64 opacity-100 pointer-events-none dark:mix-blend-screen mix-blend-multiply animate-drift" />
            <img src={shape11} alt="" className="absolute bottom-20 left-20 w-72 opacity-100 pointer-events-none dark:mix-blend-screen mix-blend-multiply animate-float-delayed" />
            <img src={shape12} alt="" className="absolute top-1/2 left-10 w-48 opacity-100 pointer-events-none dark:mix-blend-screen mix-blend-multiply brightness-0 dark:brightness-100 animate-drift-slow" />
        </div >
    );
};
