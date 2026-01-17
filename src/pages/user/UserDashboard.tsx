import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import Navbar from '../../components/Navbar';
import '../pages.css';

const UserDashboard: React.FC = () => {
    const { samples } = useBlockchain();
    const userName = localStorage.getItem('userName') || 'User';

    const completedSamples = samples.filter(s => s.status === 'completed').length;
    const inProgressSamples = samples.filter(s => s.status !== 'completed').length;

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container">

                {/* Welcome Card */}
                <div className="welcome-card">
                    <h2>Welcome, {userName.toUpperCase()}</h2>
                    <p>Track your medical samples through every step of the blockchain-verified process</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{samples.length}</div>
                        <div className="stat-label">Total Samples</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{completedSamples}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{inProgressSamples}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="action-grid">
                    <Link to="/user/track" className="action-card">
                        <div className="action-icon">🔍</div>
                        <h3>Track Sample</h3>
                        <p>Enter your transaction ID to view real-time tracking with blockchain verification</p>
                        <span className="btn btn-primary">Track Now</span>
                    </Link>
                    <Link to="/user/results" className="action-card">
                        <div className="action-icon">📊</div>
                        <h3>View Results</h3>
                        <p>Access your AI-generated risk reports with blockchain-verified analysis</p>
                        <span className="btn btn-primary">View Results</span>
                    </Link>
                </div>

                {/* Recent Samples */}
                {samples.length > 0 && (
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                            <Clock size={20} style={{ marginRight: '10px' }} /> Recent Samples
                        </h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Sample ID</th>
                                    <th>Status</th>
                                    <th>Current Step</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {samples.slice(0, 5).map((sample) => (
                                    <tr key={sample.sampleId}>
                                        <td style={{ fontFamily: 'Space Mono' }}>{sample.sampleId}</td>
                                        <td>
                                            <span className={`badge ${sample.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                {sample.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                {' '}{sample.status}
                                            </span>
                                        </td>
                                        <td>Step {sample.currentStep}/4</td>
                                        <td>
                                            <Link to={`/user/track?id=${sample.sampleId}`} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                                                <Search size={12} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {samples.length === 0 && (
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <FileText size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>No Samples Yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Your tracked samples will appear here once processed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
