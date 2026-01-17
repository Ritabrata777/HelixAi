import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dna, User, ArrowRight } from 'lucide-react';
import '../pages.css';

interface FormData {
    username: string;
    password: string;
    name: string;
}

const UserPortal: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<FormData>({ username: '', password: '', name: '' });
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', formData.name || formData.username);
        navigate('/user/dashboard');
    };

    return (
        <div className="portal-page">
            <div className="login-container">
                <Link to="/" className="portal-logo">
                    <Dna />
                    <span>HelixAI</span>
                </Link>

                <div className="login-card">
                    <div className="login-icon-wrapper">
                        <User size={32} />
                    </div>
                    <h2>User Portal</h2>
                    <p className="subtitle">Track your medical samples with blockchain verification</p>

                    <div className="auth-toggle">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
                        >Login</button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
                        >Register</button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" placeholder="Enter your name"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required={!isLogin} />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input type="text" className="form-input" placeholder="Enter username"
                                value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" placeholder="Enter password"
                                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary login-btn">
                            {isLogin ? 'Login' : 'Create Account'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <a href="#toggle" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                                {isLogin ? 'Register' : 'Login'}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPortal;
