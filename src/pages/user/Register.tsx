import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, Save, CheckCircle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register: React.FC = () => {
    const { account, isConnected } = useWallet();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        sex: 'Male',
        dob: '',
        address: '',
        phone: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // Check if user is already registered
    useEffect(() => {
        const checkUser = async () => {
            if (account) {
                try {
                    const res = await axios.get(`${API_URL}/users/${account}`);
                    if (res.data) {
                        setFormData({
                            name: res.data.name || '',
                            age: res.data.age?.toString() || '',
                            sex: res.data.sex || 'Male',
                            dob: res.data.dob ? res.data.dob.split('T')[0] : '',
                            address: res.data.address || '',
                            phone: res.data.phone || '',
                            email: res.data.email || ''
                        });
                        setIsRegistered(true);
                    }
                } catch (err) {
                    // User not found - that's okay
                }
            }
        };
        checkUser();
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            showError('Name and Phone are required');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/users`, {
                walletAddress: account || `USER-${Date.now()}`,
                name: formData.name,
                age: parseInt(formData.age) || undefined,
                sex: formData.sex,
                dob: formData.dob ? new Date(formData.dob) : undefined,
                address: formData.address,
                phone: formData.phone,
                email: formData.email
            });

            localStorage.setItem('userName', formData.name);
            showSuccess('Registration successful!');
            setIsRegistered(true);

            setTimeout(() => navigate('/user/dashboard'), 1500);
        } catch (err: any) {
            showError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container">
                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05))' }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>
                        <User size={24} style={{ marginRight: '10px' }} />
                        {isRegistered ? 'Update Profile' : 'Patient Registration'}
                    </h2>
                    <p>Please fill in your details to {isRegistered ? 'update your profile' : 'register for testing services'}.</p>
                </div>

                <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <User size={14} style={{ marginRight: '5px' }} /> Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="form-input"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="Age"
                                    min="1"
                                    max="150"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sex</label>
                                <select
                                    name="sex"
                                    className="form-input"
                                    value={formData.sex}
                                    onChange={handleChange}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={14} style={{ marginRight: '5px' }} /> Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                className="form-input"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Phone size={14} style={{ marginRight: '5px' }} /> Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <MapPin size={14} style={{ marginRight: '5px' }} /> Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                className="form-input"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                                style={{ flex: 1 }}
                            >
                                {isSubmitting ? 'Saving...' : (
                                    <>
                                        <Save size={18} style={{ marginRight: '8px' }} />
                                        {isRegistered ? 'Update Profile' : 'Register'}
                                    </>
                                )}
                            </button>
                            <Link to="/user/dashboard" className="btn btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
