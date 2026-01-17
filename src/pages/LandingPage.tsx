import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, User, FlaskConical, Shield, GitBranch, Cpu, Lock } from 'lucide-react';
import './pages.css';


const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <div className="logo">
                        <Dna className="logo-icon" />
                        <span className="logo-text">HelixAI</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="gradient-text">Blockchain-Powered</span>
                        <br />
                        Medical Sample Tracking
                    </h1>

                    <p className="hero-subtitle">
                        Secure, transparent, and immutable tracking of your medical samples
                        from collection to AI-powered analysis
                    </p>

                    {/* Portal Cards */}
                    <div className="portal-cards">
                        <Link to="/user" className="portal-card user-portal">
                            <div className="portal-icon-wrapper">
                                <User className="portal-icon" />
                            </div>
                            <h2>User Portal</h2>
                            <p>Track your samples with transaction ID. View blockchain-verified journey from collection to results.</p>
                            <div className="portal-features">
                                <span><Shield size={14} /> Verified Results</span>
                                <span><GitBranch size={14} /> Track Progress</span>
                            </div>
                            <div className="portal-btn">Enter Portal →</div>
                        </Link>

                        <Link to="/lab" className="portal-card lab-portal">
                            <div className="portal-icon-wrapper">
                                <FlaskConical className="portal-icon" />
                            </div>
                            <h2>Lab Portal</h2>
                            <p>Process samples, run AI analysis, and generate blockchain-verified risk reports.</p>
                            <div className="portal-features">
                                <span><Cpu size={14} /> AI Analysis</span>
                                <span><Lock size={14} /> Secure Data</span>
                            </div>
                            <div className="portal-btn">Enter Portal →</div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-icon">🔬</div>
                        <h3>Collection</h3>
                        <p>Nurse scans test tube QR code. Blockchain generates Hash #1 with timestamp, Patient ID, and GPS location.</p>
                    </div>

                    <div className="step-connector"></div>

                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-icon">🚚</div>
                        <h3>Transport</h3>
                        <p>Logistics picks up sample. Hash #2 verifies custody transfer and tracks delivery path.</p>
                    </div>

                    <div className="step-connector"></div>

                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-icon">🧬</div>
                        <h3>Sequencing</h3>
                        <p>Lab runs Low-Pass WGS. Hash #3 records raw data checksum proving data integrity.</p>
                    </div>

                    <div className="step-connector"></div>

                    <div className="step-card">
                        <div className="step-number">04</div>
                        <div className="step-icon">🤖</div>
                        <h3>AI Analysis</h3>
                        <p>AI processes data. Smart Contract triggers Risk Report generation automatically.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Powered by Blockchain Technology • Secured with Smart Contracts</p>
            </footer>
        </div>
    );
};

export default LandingPage;
