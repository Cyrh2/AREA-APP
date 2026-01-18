import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <img src={logo} alt="AREA Logo" className="h-24 w-auto mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h2>
                    <p className="text-gray-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                </div>

                <div className="bg-[#11131A] border border-gray-800/50 p-8 rounded-2xl shadow-xl">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-white font-bold text-lg">Email envoyé !</h3>
                            <p className="text-gray-400 text-sm">Vérifiez votre boîte de réception (et vos spams) pour réinitialiser votre mot de passe.</p>
                            <Link to="/login">
                                <Button variant="secondary" fullWidth className="mt-4">Retour à la connexion</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="exemple@email.com" icon={Mail} />

                            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}

                            <Button fullWidth loading={loading} icon={Send}>Envoyer le lien</Button>
                        </form>
                    )}
                </div>

                <div className="text-center">
                    <Link to="/login" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};
