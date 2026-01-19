import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Phone, MapPin, Calendar, Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface TestRequest {
    requestId: string;
    labId: string;
    labName: string;
    userId: string;
    patientInfo: {
        name: string;
        age: number;
        sex: string;
        dob: string;
        address: string;
        phone: string;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    createdAt: string;
}

const TestRequests: React.FC = () => {
    const { showSuccess, showError } = useToast();
    const [requests, setRequests] = useState<TestRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/test-requests`);
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await axios.put(`${API_URL}/test-requests/${requestId}`, { status });
            showSuccess(`Request ${status}!`);
            fetchRequests();
        } catch (err: any) {
            showError(err.message || 'Action failed');
        }
    };

    const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
            case 'accepted':
                return <span className="badge badge-success"><CheckCircle size={12} /> Accepted</span>;
            case 'rejected':
                return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">
                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)' }}>
                                <Bell size={24} style={{ marginRight: '10px' }} />
                                Test Requests
                            </h2>
                            <p>View and manage incoming test requests from patients.</p>
                        </div>
                        {pendingCount > 0 && (
                            <div style={{
                                background: 'var(--accent-purple)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}>
                                {pendingCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {(['pending', 'accepted', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <Bell size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                        <h3>No {filter !== 'all' ? filter : ''} requests</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {filter === 'pending' ? 'All caught up! No pending requests.' : 'No requests to show.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredRequests.map(request => (
                            <div key={request.requestId} className="form-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
                                            {request.patientInfo.name}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            Request ID: {request.requestId}
                                        </p>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '15px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    marginBottom: '15px'
                                }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <User size={12} /> Name
                                        </span>
                                        <p style={{ fontWeight: 'bold' }}>{request.patientInfo.name}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Age</span>
                                        <p style={{ fontWeight: 'bold' }}>{request.patientInfo.age || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sex</span>
                                        <p style={{ fontWeight: 'bold' }}>{request.patientInfo.sex}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Phone size={12} /> Phone
                                        </span>
                                        <p style={{ fontWeight: 'bold' }}>{request.patientInfo.phone}</p>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <MapPin size={12} /> Address
                                        </span>
                                        <p style={{ fontWeight: 'bold' }}>{request.patientInfo.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Calendar size={12} /> Requested On
                                        </span>
                                        <p style={{ fontWeight: 'bold' }}>{new Date(request.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {request.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleAction(request.requestId, 'accepted')}
                                            className="btn btn-primary"
                                            style={{ flex: 1 }}
                                        >
                                            <Check size={18} style={{ marginRight: '8px' }} />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.requestId, 'rejected')}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                        >
                                            <X size={18} style={{ marginRight: '8px' }} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <Link to="/lab/dashboard" className="btn btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TestRequests;
