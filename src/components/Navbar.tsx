import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna, Home, Activity, FileText, QrCode, Brain, Clock, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
    portal: 'user' | 'lab';
}

const Navbar: React.FC<NavbarProps> = ({ portal }) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const userLinks = [
        { path: '/user/dashboard', label: 'Dashboard', icon: Home },
        { path: '/user/track', label: 'Track Sample', icon: Activity },
        { path: '/user/results', label: 'Results', icon: FileText },
    ];

    const labLinks = [
        { path: '/lab/dashboard', label: 'Dashboard', icon: Home },
        { path: '/lab/scan', label: 'Scan Sample', icon: QrCode },
        { path: '/lab/analyze', label: 'AI Analysis', icon: Brain },
        { path: '/lab/history', label: 'History', icon: Clock },
    ];

    const links = portal === 'user' ? userLinks : labLinks;
    const accentColor = portal === 'user' ? 'var(--accent-cyan)' : 'var(--accent-purple)';

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <Dna className="navbar-logo-icon" />
                        <span className="navbar-logo-text">HelixAI</span>
                        <span className="navbar-portal-badge" style={{ 
                            background: portal === 'user' ? 'rgba(0, 255, 200, 0.15)' : 'rgba(100, 50, 255, 0.15)',
                            color: accentColor,
                            borderColor: accentColor
                        }}>
                            {portal === 'user' ? 'Patient' : 'Lab'}
                        </span>
                    </Link>

                    <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                        {links.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`navbar-link ${location.pathname === path ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ '--accent': accentColor } as React.CSSProperties}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </Link>
                        ))}
                        <Link to="/" className="navbar-logout" onClick={() => setMobileMenuOpen(false)}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </Link>
                    </div>

                    <button 
                        className="navbar-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>
            {mobileMenuOpen && <div className="navbar-overlay" onClick={() => setMobileMenuOpen(false)} />}
        </>
    );
};

export default Navbar;
