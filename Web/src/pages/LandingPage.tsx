import { Link } from 'react-router-dom';
import { Download, Globe, Zap, Menu, X, Smartphone, ArrowRight, Mail, Cloud, Twitter, Github, Twitch, Slack } from 'lucide-react';
import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/logo.png';
import firstImage from '../assets/first.png';
import helloLightImage from '../assets/light/hello.png';
import helloDarkImage from '../assets/hello-dark.png';
import mobileAppImage from '../assets/Image collée (2).png';
import entrepreneurImage from '../assets/Entrepreneur Boy Break Through Clipart 1.png';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen font-sans text-white overflow-x-hidden selection:bg-[#5865F2] selection:text-white bg-white dark:bg-[#020617] transition-colors duration-300 relative">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 w-full z-50 h-20 flex items-center justify-between px-6 transition-all duration-300 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-md shadow-lg text-black dark:text-white"
            >
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display font-black text-2xl tracking-tighter cursor-pointer">
                        <img src={logo} alt="AREA" className="h-24 w-auto transition-all duration-300" />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8 font-bold text-[16px]">
                        {['Télécharger', 'Services', 'Fonctionnalités', 'À propos'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="hover:underline underline-offset-4 decoration-2 transition-all decoration-[#5865F2] hover:text-[#5865F2]">
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA & Mobile Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-[#5865F2] text-white hover:bg-[#4752C4]"
                        >
                            Se connecter
                        </Link>
                        <ThemeToggle />
                        <button
                            className="lg:hidden text-black dark:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            {
                isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-white dark:bg-[#020617] text-black dark:text-white z-40 pt-24 px-6 lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-xl font-display font-bold">
                            {['Télécharger', 'Services', 'Fonctionnalités', 'À propos'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="py-3 border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMenuOpen(false)}>
                                    {item}
                                </a>
                            ))}
                            <Link to="/login" className="bg-[#5865F2] text-white px-6 py-4 rounded-full w-full text-center mt-4 shadow-xl">
                                Se connecter
                            </Link>
                        </div>
                    </motion.div>
                )
            }

            {/* Hero Section */}
            <header className="relative bg-[#404EED] dark:bg-[#0b0d14] pt-20 pb-20 md:pt-24 md:pb-40 px-6 overflow-hidden transition-colors duration-300">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3109/6257d23c5fb25be7e0b6e220_stars.svg')] opacity-40"></div>
                    <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-96 h-96 bg-[#5865F2] rounded-full blur-3xl opacity-50 mix-blend-multiply"></motion.div>
                    <motion.div style={{ y: y2 }} className="absolute top-40 -right-20 w-72 h-72 bg-[#EB459E] rounded-full blur-3xl opacity-30 mix-blend-screen"></motion.div>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div
                        className="text-center md:text-left"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="font-display text-5xl md:text-[5.5rem] font-black mb-6 uppercase tracking-tighter leading-[0.9] drop-shadow-sm"
                        >
                            ACTION - <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">RÉACTION</span>
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-2xl leading-relaxed mb-10 font-medium text-white/90 max-w-lg mx-auto md:mx-0"
                        >
                            Automatisez votre vie numérique.
                            <span className="block mt-2 text-white/80 text-base md:text-lg font-normal">
                                Une plateforme puissante qui connecte vos services préférés.
                                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded ml-1">SI [Action] ALORS [RÉaction]</span>
                            </span>
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center md:items-start gap-4"
                        >
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="/client.apk"
                                className="bg-white text-[#23272a] px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:text-[#5865F2] shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all w-full sm:w-auto justify-center group"
                            >
                                <Download size={24} className="group-hover:text-[#5865F2] transition-colors" />
                                Télécharger Android
                            </motion.a>
                            <Link to="/login" className="w-full sm:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-[#23272a] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#36393f] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    Ouvrir AREA
                                    <ArrowRight size={20} />
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="flex justify-center md:justify-end relative"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="relative z-10">
                            <motion.img
                                animate={{ y: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                src={entrepreneurImage}
                                alt="Illustration AREA"
                                className="w-full max-w-xl object-contain drop-shadow-2xl"
                            />
                        </div>
                        {/* Blob behind image */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/10 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </header>

            {/* Feature 1 */}
            <section id="services" className="py-4 md:py-8 bg-white dark:bg-[#020617] text-[#23272a] dark:text-gray-200 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 md:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-6 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-3xl -z-10 transform -rotate-2 scale-105"></div>
                        <img src={helloLightImage} alt="Services" className="w-full relative z-10 drop-shadow-xl hover:scale-[1.02] transition-transform duration-500 block dark:hidden" />
                        <img src={helloDarkImage} alt="Services" className="w-full relative z-10 drop-shadow-xl hover:scale-[1.02] transition-transform duration-500 hidden dark:block" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="md:col-span-6"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">
                            Connectez vos services préférés
                        </h2>
                        <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400 font-medium mb-8">
                            Interconnectez Outlook 365, Google, OneDrive, X (Twitter), et bien d'autres.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Mail, label: "Outlook" },
                                { icon: Cloud, label: "OneDrive" },
                                { icon: Twitter, label: "Twitter" },
                                { icon: Github, label: "GitHub" },
                                { icon: Twitch, label: "Twitch" },
                                { icon: Slack, label: "Slack" }
                            ].map((Service, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-[#11131A] rounded-xl hover:bg-[#5865F2]/10 hover:text-[#5865F2] transition-colors cursor-pointer group">
                                    <Service.icon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">{Service.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature 2 */}
            <section id="features" className="py-4 md:py-8 bg-[#f6f6f6] dark:bg-[#0f111a] border-y dark:border-white/5 text-[#23272a] dark:text-gray-200 relative overflow-hidden transition-colors duration-300">
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-200/50 dark:bg-gray-800/20 skew-x-12 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 md:gap-24 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="md:col-span-6 order-2 md:order-1"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">
                            Créez des AREAs puissantes
                        </h2>
                        <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400 font-medium mb-8">
                            Définissez des déclencheurs (Actions) et des conséquences (REActions) en quelques clics.
                        </p>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                            <p className="font-mono text-sm text-gray-500 mb-4 uppercase tracking-wider font-bold">Exemple de Workflow</p>
                            <div className="flex items-center gap-4 text-lg font-bold">
                                <div className="flex items-center gap-2 bg-blue-50 text-[#5865F2] px-4 py-2 rounded-lg">
                                    <Mail size={20} />
                                    <span>Email Reçu</span>
                                </div>
                                <ArrowRight size={20} className="text-gray-400" />
                                <div className="flex items-center gap-2 bg-pink-50 text-[#EB459E] px-4 py-2 rounded-lg">
                                    <Zap size={20} />
                                    <span>Notif Discord</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-6 order-1 md:order-2"
                    >
                        <img src={firstImage} alt="AREA Workflow" className="w-full drop-shadow-2xl hover:rotate-1 transition-transform duration-500" />
                    </motion.div>
                </div>
            </section>

            {/* Feature 3 */}
            <section className="py-4 md:py-8 bg-white dark:bg-[#020617] text-[#23272a] dark:text-gray-200 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 md:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-6"
                    >
                        <img src={mobileAppImage} alt="Mobile App" className="w-full drop-shadow-xl" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="md:col-span-6"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight">
                            Disponible partout
                        </h2>
                        <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                            Gérez vos automatisations depuis votre navigateur ou emportez-les avec vous grâce à notre application mobile Android.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Big Feature Section */}
            <section id="download" className="py-4 md:py-8 bg-[#f6f6f6] dark:bg-[#0f111a] border-t dark:border-white/5 text-[#23272a] dark:text-gray-200 text-center relative transition-colors duration-300">
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="relative inline-block">
                        <h3 className="font-display text-[32px] font-bold mb-8 bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3109/6257d23c5fb25be7e0b6e220_stars.svg')] bg-no-repeat bg-top pt-10">
                            Prêt à commencer l'aventure ?
                        </h3>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/client.apk"
                            className="bg-[#5865F2] text-white px-10 py-5 rounded-full font-bold text-xl flex items-center gap-3 hover:bg-[#4752C4] shadow-xl hover:shadow-2xl hover:shadow-[#5865F2]/40 transition-all mx-auto w-fit"
                        >
                            <Download size={28} />
                            Télécharger pour Android
                        </motion.a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#23272a] pt-24 pb-16 px-6 text-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1">
                        <h3 className="text-[#5865F2] font-display font-black text-3xl mb-8 uppercase flex items-center gap-2">
                            <Globe size={28} />
                            AREA
                        </h3>
                        <div className="flex gap-6 mt-8">
                            {[Globe, Smartphone, Zap].map((Icon, i) => (
                                <a key={i} href="#" className="hover:text-[#5865F2] transition-colors transform hover:scale-110 duration-200">
                                    <Icon size={28} />
                                </a>
                            ))}
                        </div>
                    </div>
                    {[
                        { title: 'Produit', links: ['Télécharger', 'Services', 'Dashboard'] },
                        { title: 'Projet', links: ['À propos', 'Équipe', 'Documentation'] },
                        { title: 'Ressources', links: ['Aide', 'API', 'GitHub'] }
                    ].map((col) => (
                        <div key={col.title} className="col-span-1 space-y-4">
                            <h4 className="text-[#5865F2] font-bold">{col.title}</h4>
                            <ul className="space-y-2 text-gray-400">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="hover:text-white hover:underline transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto border-t border-[#5865F2] pt-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                        <img src={logo} alt="AREA" className="h-20 w-auto" />
                    </div>
                    <Link to="/register" className="bg-[#5865F2] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#4752C4] hover:shadow-lg transition-all">
                        S'inscrire
                    </Link>
                </div>
            </footer>
        </div >
    );
};
