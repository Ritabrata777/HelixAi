import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TestTube, Building2, Send, CheckCircle, User, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Lab {
    labId: string;
    name: string;
    address: string;
    city: string;
    phone: string;
}

interface UserProfile {
    name: string;
    age: number;
    sex: string;
    dob: string;
    address: string;
    phone: string;
}

const RequestTest: React.FC = () => {
    const { account } = useWallet();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const [labs, setLabs] = useState<Lab[]>([]);
    const [selectedLab, setSelectedLab] = useState<string>('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch labs
                const labsRes = await axios.get(`${API_URL}/labs`);
                setLabs(labsRes.data);

                // If no labs, seed them
                if (labsRes.data.length === 0) {
                    await axios.post(`${API_URL}/labs/seed`);
                    const newLabsRes = await axios.get(`${API_URL}/labs`);
                    setLabs(newLabsRes.data);
                }

                // Fetch user profile
                if (account) {
                    try {
                        const userRes = await axios.get(`${API_URL}/users/${account}`);
                        setUserProfile(userRes.data);
                    } catch (err) {
                        // User not registered
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [account]);

    const handleSubmit = async () => {
        if (!selectedLab) {
            showError('Please select a lab');
            return;
        }
        if (!userProfile) {
            showError('Please register first');
            navigate('/user/register');
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedLabData = labs.find(l => l.labId === selectedLab);

            await axios.post(`${API_URL}/test-requests`, {
                labId: selectedLab,
                labName: selectedLabData?.name,
                userId: account || 'GUEST',
                patientInfo: {
                    name: userProfile.name,
                    age: userProfile.age,
                    sex: userProfile.sex,
                    dob: userProfile.dob,
                    address: userProfile.address,
                    phone: userProfile.phone
                }
            });

            showSuccess('Test request sent successfully!');
            setSuccess(true);
        } catch (err: any) {
            showError(err.message || 'Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="portal-page">
                <Navbar portal="user" />
                <div className="portal-container">
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <CheckCircle size={80} style={{ color: 'var(--success)', marginBottom: '20px' }} />
                        <h2 style={{ fontFamily: 'Orbitron', color: 'var(--success)', marginBottom: '10px' }}>
                            Request Sent!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                            Your test request has been sent to the lab. They will contact you soon.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={() => { setSuccess(false); setSelectedLab(''); }} className="btn btn-primary">
                                Send Another Request
                            </button>
                            <Link to="/user/dashboard" className="btn btn-secondary">
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container">
                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05))' }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>
                        <TestTube size={24} style={{ marginRight: '10px' }} />
                        Request a Test
                    </h2>
                    <p>Select a lab and send your test request. Your details will be shared with the lab.</p>
                </div>

                {!userProfile && !isLoading && (
                    <div className="form-card" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'var(--warning)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <AlertTriangle size={40} style={{ color: 'var(--warning)' }} />
                            <div>
                                <h3 style={{ color: 'var(--warning)', marginBottom: '5px' }}>Registration Required</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                                    Please register your details before requesting a test.
                                </p>
                                <Link to="/user/register" className="btn btn-primary">
                                    <User size={16} style={{ marginRight: '8px' }} />
                                    Register Now
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {userProfile && (
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '15px' }}>
                            <User size={20} style={{ marginRight: '10px' }} />
                            Your Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Name</span>
                                <p style={{ fontWeight: 'bold' }}>{userProfile.name}</p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Age</span>
                                <p style={{ fontWeight: 'bold' }}>{userProfile.age || 'N/A'}</p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sex</span>
                                <p style={{ fontWeight: 'bold' }}>{userProfile.sex}</p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phone</span>
                                <p style={{ fontWeight: 'bold' }}>{userProfile.phone}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Address</span>
                                <p style={{ fontWeight: 'bold' }}>{userProfile.address || 'N/A'}</p>
                            </div>
                        </div>
                        <Link to="/user/register" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>
                            Edit Details →
                        </Link>
                    </div>
                )}

                <div className="form-card">
                    <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                        <Building2 size={20} style={{ marginRight: '10px' }} />
                        Select a Lab
                    </h3>

                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading labs...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {labs.map(lab => (
                                <button
                                    key={lab.labId}
                                    onClick={() => setSelectedLab(lab.labId)}
                                    style={{
                                        padding: '20px',
                                        background: selectedLab === lab.labId ? 'rgba(0, 255, 200, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                        border: `2px solid ${selectedLab === lab.labId ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '5px', color: selectedLab === lab.labId ? 'var(--accent-cyan)' : 'inherit' }}>
                                                {lab.name}
                                            </h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {lab.address}, {lab.city}
                                            </p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                📞 {lab.phone}
                                            </p>
                                        </div>
                                        {selectedLab === lab.labId && (
                                            <CheckCircle size={24} style={{ color: 'var(--accent-cyan)' }} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                            disabled={!selectedLab || !userProfile || isSubmitting}
                            style={{ flex: 1 }}
                        >
                            <Send size={18} style={{ marginRight: '8px' }} />
                            {isSubmitting ? 'Sending...' : 'Send Request'}
                        </button>
                        <Link to="/user/dashboard" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestTest;
