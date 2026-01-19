import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Clock, CheckCircle, AlertCircle, Bot, Package, Loader, TestTube, User } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import Navbar from '../../components/Navbar';

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
                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05))' }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>Welcome, {userName}</h2>
                    <p>Track your medical samples through every step of the blockchain-verified process.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <Package size={24} className="stat-icon" />
                        <div>
                            <div className="stat-value">{samples.length}</div>
                            <div className="stat-label">Total Samples</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <CheckCircle size={24} className="stat-icon" style={{ color: 'var(--success)' }} />
                        <div>
                            <div className="stat-value" style={{ color: 'var(--success)' }}>{completedSamples}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Loader size={24} className="stat-icon" style={{ color: 'var(--warning)' }} />
                        <div>
                            <div className="stat-value" style={{ color: 'var(--warning)' }}>{inProgressSamples}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="action-grid">
                    <Link to="/user/request-test" className="action-card">
                        <div className="action-icon-wrapper" style={{ color: 'var(--success)' }}>
                            <TestTube />
                        </div>
                        <h3>Request a Test</h3>
                        <p>Select a lab and request a new test. Your details will be shared with the lab.</p>
                        <span className="btn btn-secondary" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>Request Test</span>
                    </Link>
                    <Link to="/user/track" className="action-card">
                        <div className="action-icon-wrapper">
                            <Search />
                        </div>
                        <h3>Track a Sample</h3>
                        <p>Enter your transaction ID to view real-time tracking with blockchain verification.</p>
                        <span className="btn btn-secondary">Track Now</span>
                    </Link>
                    <Link to="/user/results" className="action-card">
                        <div className="action-icon-wrapper">
                            <FileText />
                        </div>
                        <h3>View Results</h3>
                        <p>Access your AI-generated risk reports with blockchain-verified analysis.</p>
                        <span className="btn btn-secondary">View Results</span>
                    </Link>
                    <Link to="/user/chat-with-pdf" className="action-card">
                        <div className="action-icon-wrapper">
                            <Bot />
                        </div>
                        <h3>AI Document Chat</h3>
                        <p>Upload a PDF and ask questions about its content with our AI assistant.</p>
                        <span className="btn btn-secondary">Start Chatting</span>
                    </Link>
                </div>

                {/* Recent Samples */}
                {samples.length > 0 ? (
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                            <Clock size={20} style={{ marginRight: '10px' }} /> Recent Samples
                        </h3>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sample ID</th>
                                        <th>Status</th>
                                        <th>Current Step</th>
                                        <th>Created On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {samples.slice(-5).reverse().map((sample) => (
                                        <tr key={sample.sampleId}>
                                            <td data-label="Sample ID" style={{ fontFamily: 'Space Mono' }}>{sample.sampleId}</td>
                                            <td data-label="Status">
                                                <span className={`badge ${sample.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {sample.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                    {' '}{sample.status}
                                                </span>
                                            </td>
                                            <td data-label="Current Step">
                                                <div className="step-indicator">
                                                    <div className="step-indicator-bar" style={{ width: `${(sample.currentStep / 4) * 100}%` }}></div>
                                                    <span>{sample.currentStep}/4</span>
                                                </div>
                                            </td>
                                            <td data-label="Created On">{new Date(sample.createdAt).toLocaleDateString()}</td>
                                            <td data-label="Action">
                                                <Link to={`/user/track?id=${sample.sampleId}`} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                                                    <Search size={12} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="form-card empty-state">
                        <FileText size={60} />
                        <h3>No Samples Yet</h3>
                        <p>Your tracked samples will appear here once they are collected.</p>
                        <Link to="/user/track" className="btn btn-primary">
                            Track Your First Sample
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
