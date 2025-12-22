import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import Chatbot from '../Chatbot';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props for the LandingLayout component.
 */
interface LandingLayoutProps {
    children: ReactNode; // The content (page) to display within the layout
}

/**
 * LandingLayout Component.
 * 
 * Provides the structure for the public-facing landing page, including:
 * - A transparent/glassmorphism header that becomes sticky
 * - Navigation links for the landing page sections (Features, Solutions, etc.)
 * - Authentication action buttons (Login/Get Started)
 * - Mobile responsive menu
 */
const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
    const { isAuthenticated, openModal } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-lime-400 selection:text-slate-900 flex flex-col">
            {/* Improved Header with better spacing and visual hierarchy */}
            <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-gradient-to-br from-lime-400 to-lime-600 p-2 rounded-xl shadow-lg shadow-lime-400/20 group-hover:shadow-lime-400/40 transition-all duration-300">
                            <Zap className="text-slate-900 fill-slate-900" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold font-display tracking-tight text-white leading-none">
                                Route<span className="text-lime-400">Mind</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium leading-none mt-1">
                                AI Logistics
                            </span>
                        </div>
                    </div>

                    {/* Desktop Nav - Centered with hover effects */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Auth Button */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-6 py-2.5 bg-lime-400 text-slate-900 rounded-lg font-bold hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20 hover:shadow-lime-400/40 hover:-translate-y-0.5 text-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button onClick={openModal} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                                    Log In
                                </button>
                                <button
                                    onClick={openModal}
                                    className="px-6 py-2.5 bg-white/10 text-white border border-white/10 rounded-lg font-bold hover:bg-white/20 hover:border-white/20 transition-all text-sm backdrop-blur-sm"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-950 z-40 pt-28 px-6 md:hidden animate-in slide-in-from-top-10">
                    <nav className="flex flex-col space-y-6 text-center text-xl font-bold text-slate-300">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                        <button
                            onClick={() => { openModal(); setMobileMenuOpen(false); }}
                            className="text-lime-400 border border-lime-400/20 py-3 rounded-xl bg-lime-400/10 mt-4"
                        >
                            Log In / Sign Up
                        </button>
                    </nav>
                </div>
            )}

            <main className="flex-1 pt-20">
                {children}
            </main>

            <Chatbot />
        </div>
    );
};

export default LandingLayout;
