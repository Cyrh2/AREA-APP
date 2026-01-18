import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';
import logo from '../assets/logo.png';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token manquant. Veuillez cliquer sur le lien reçu par email.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la réinitialisation.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="bg-[#11131A] border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-white mb-2">Lien invalide</h2>
                <p className="text-gray-400 mb-6">Le lien de réinitialisation est invalide ou manquant.</p>
                <Link to="/forgot-password"><Button>Renvoyer un lien</Button></Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <img src={logo} alt="AREA Logo" className="h-24 w-auto mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Nouveau mot de passe</h2>
                    <p className="text-gray-400">Définissez votre nouveau mot de passe sécurisé.</p>
                </div>

                <div className="bg-[#11131A] border border-gray-800/50 p-8 rounded-2xl shadow-xl">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-white font-bold text-lg">Mot de passe modifié !</h3>
                            <p className="text-gray-400 text-sm">Vous allez être redirigé vers la connexion...</p>
                            <Button fullWidth onClick={() => navigate('/login')}>Se connecter maintenant</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Nouveau mot de passe"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="••••••••"
                                icon={Lock}
                            />
                            <div className="text-xs text-gray-500 px-1 -mt-2 mb-2">
                                Min 8 car., 1 lettre, 1 chiffre, 1 spécial.
                            </div>

                            <Input
                                label="Confirmer le mot de passe"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder="••••••••"
                                icon={Lock}
                            />

                            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}

                            <Button fullWidth loading={loading} icon={ArrowRight}>Réinitialiser</Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
