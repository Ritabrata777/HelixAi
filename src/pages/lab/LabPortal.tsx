import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dna, FlaskConical, ArrowRight, Shield, Wallet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import '../pages.css';

interface FormData {
    labId: string;
    password: string;
    labName: string;
}

const LabPortal: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({ labId: '', password: '', labName: '' });
    const navigate = useNavigate();
    const { account, isConnected, isConnecting, connectWallet, switchToAmoy, isAmoyNetwork, error } = useWallet();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        localStorage.setItem('labLoggedIn', 'true');
        localStorage.setItem('labName', formData.labName || formData.labId);
        localStorage.setItem('labWallet', account || '');
        navigate('/lab/dashboard');
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="portal-page">
            <div className="login-container">
                <Link to="/" className="portal-logo">
                    <Dna /><span>HelixAI</span>
                </Link>

                <div className="login-card lab-login">
                    <div className="login-icon-wrapper lab">
                        <FlaskConical size={32} />
                    </div>
                    <h2>Lab Portal</h2>
                    <p className="subtitle">Process samples and run AI-powered analysis</p>

                    <div className="auth-badge">
                        <Shield size={14} />
                        <span>Authorized Personnel Only</span>
                    </div>

                    {/* Wallet Connection Section */}
                    <div className="wallet-section">
                        {!isConnected ? (
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="btn wallet-connect-btn"
                            >
                                <Wallet size={18} />
                                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                            </button>
                        ) : (
                            <div className="wallet-connected">
                                <div className="wallet-status">
                                    <CheckCircle size={16} />
                                    <span>Wallet Connected</span>
                                </div>
                                <div className="wallet-address">
                                    {account ? formatAddress(account) : ''}
                                </div>

                                {!isAmoyNetwork && (
                                    <button onClick={switchToAmoy} className="switch-network-btn">
                                        <AlertTriangle size={14} />
                                        Switch to Polygon Amoy
                                    </button>
                                )}
                                {isAmoyNetwork && (
                                    <div className="network-badge">✓ Polygon Amoy Network</div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="wallet-error">{error}</div>
                        )}
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Lab Name</label>
                            <input type="text" className="form-input" placeholder="Enter lab name"
                                value={formData.labName} onChange={(e) => setFormData({ ...formData, labName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Lab ID</label>
                            <input type="text" className="form-input" placeholder="Enter lab ID"
                                value={formData.labId} onChange={(e) => setFormData({ ...formData, labId: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" placeholder="Enter password"
                                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <button
                            type="submit"
                            className={`btn login-btn ${isConnected ? 'btn-primary lab' : 'btn-disabled'}`}
                            disabled={!isConnected}
                        >
                            {isConnected ? 'Access Lab Portal' : 'Connect Wallet First'}
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Not a lab technician? <Link to="/user">Go to User Portal</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabPortal;
