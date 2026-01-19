import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dna, User, ArrowRight, Phone, MapPin, Calendar, Mail, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import '../pages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FormData {
    username: string;
    password: string;
    name: string;
    age: string;
    sex: string;
    dob: string;
    phone: string;
    email: string;
    address: string;
}

const UserPortal: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<FormData>({
        username: '', password: '', name: '', age: '', sex: 'Male', dob: '', phone: '', email: '', address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!isLogin) {
                await axios.post(`${API_URL}/users`, {
                    walletAddress: formData.phone, // Use phone as unique ID
                    name: formData.name,
                    age: parseInt(formData.age) || undefined,
                    sex: formData.sex,
                    dob: formData.dob ? new Date(formData.dob) : undefined,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address
                });
                showSuccess('Registration successful!');
            }
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', formData.name || formData.username);
            navigate('/user/dashboard');
        } catch (err: any) {
            showError(err.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = { padding: '14px 16px', fontSize: '0.95rem' };
    const labelStyle: React.CSSProperties = { fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' };

    return (
        <div className="portal-page">
            <div className="login-container">
                <Link to="/" className="portal-logo">
                    <Dna /><span>HelixAI</span>
                </Link>

                <div className="login-card" style={{
                    maxWidth: isLogin ? '420px' : '480px',
                    width: '100%',
                    padding: '30px 35px'
                }}>
                    <div className="login-icon-wrapper"><User size={32} /></div>
                    <h2 style={{ marginBottom: '5px' }}>User Portal</h2>
                    <p className="subtitle" style={{ marginBottom: '20px' }}>Track your medical samples with blockchain verification</p>

                    <div className="auth-toggle" style={{ marginBottom: '25px' }}>
                        <button onClick={() => setIsLogin(true)} className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}>Login</button>
                        <button onClick={() => setIsLogin(false)} className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}>Register</button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {isLogin ? (
                            <>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}>Username</label>
                                    <input type="text" className="form-input" placeholder="Enter username" style={inputStyle}
                                        value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}>Password</label>
                                    <input type="password" className="form-input" placeholder="Enter password" style={inputStyle}
                                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn btn-primary login-btn" disabled={isSubmitting} style={{ marginTop: '10px', padding: '14px' }}>
                                    {isSubmitting ? 'Please wait...' : 'Login'} <ArrowRight size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Full Name */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}><User size={14} /> Full Name *</label>
                                    <input type="text" className="form-input" placeholder="Enter your full name" style={inputStyle}
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>

                                {/* Age + Sex */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label" style={labelStyle}>Age</label>
                                        <input type="number" className="form-input" placeholder="Age" min="1" max="150" style={inputStyle}
                                            value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                        <label className="form-label" style={labelStyle}>Sex</label>
                                        <select className="form-input" style={inputStyle} value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}><Calendar size={14} /> Date of Birth</label>
                                    <input type="date" className="form-input" style={inputStyle}
                                        value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                                </div>

                                {/* Phone */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}><Phone size={14} /> Phone Number *</label>
                                    <input type="tel" className="form-input" placeholder="Enter phone number" style={inputStyle}
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>

                                {/* Email */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}><Mail size={14} /> Email</label>
                                    <input type="email" className="form-input" placeholder="Enter email address" style={inputStyle}
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                {/* Address */}
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={labelStyle}><MapPin size={14} /> Address</label>
                                    <input type="text" className="form-input" placeholder="Enter your address" style={inputStyle}
                                        value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                {/* Password */}
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" style={labelStyle}>Password *</label>
                                    <input type="password" className="form-input" placeholder="Create a password" style={inputStyle}
                                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                </div>

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="btn btn-primary login-btn" disabled={isSubmitting} style={{ flex: 2, padding: '14px' }}>
                                        <Save size={18} style={{ marginRight: '8px' }} />
                                        {isSubmitting ? 'Please wait...' : 'Register'}
                                    </button>
                                    <Link to="/" className="btn btn-secondary" style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
                                        Cancel
                                    </Link>
                                </div>
                            </>
                        )}
                    </form>

                    <div className="login-footer" style={{ marginTop: '20px' }}>
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
