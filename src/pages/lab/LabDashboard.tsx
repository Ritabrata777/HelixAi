import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, AlertTriangle } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import Navbar from '../../components/Navbar';
import '../pages.css';

const LabDashboard: React.FC = () => {
    const { samples, transactions } = useBlockchain();
    const labName = localStorage.getItem('labName') || 'Lab Admin';

    const highRiskCount = samples.filter(s => (s.riskScore || 0) >= 70).length;
    const pendingCount = samples.filter(s => s.status !== 'completed').length;
    const completedCount = samples.filter(s => s.status === 'completed').length;

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">

                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(100,50,255,0.1), rgba(255,0,255,0.05))' }}>
                    <h2 style={{ color: 'var(--accent-purple)' }}>⬢ LAB DASHBOARD</h2>
                    <p>Welcome, {labName.toUpperCase()} - Manage patient diagnostics and run AI analysis</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{samples.length}</div>
                        <div className="stat-label">Total Samples</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value danger">{highRiskCount}</div>
                        <div className="stat-label">High Risk Cases</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
                        <div className="stat-label">Pending Analysis</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{completedCount}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="action-grid">
                    <Link to="/lab/scan" className="action-card">
                        <div className="action-icon">🔬</div>
                        <h3>Scan New Sample</h3>
                        <p>Scan QR code to register new sample and generate blockchain Hash #1</p>
                        <span className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6432ff, #00ffcc)' }}>Start Scanning</span>
                    </Link>
                    <Link to="/lab/analyze" className="action-card">
                        <div className="action-icon">🤖</div>
                        <h3>AI Analysis</h3>
                        <p>Process sequenced samples with AI and generate risk reports</p>
                        <span className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6432ff, #ff00ff)' }}>Run Analysis</span>
                    </Link>
                    <Link to="/lab/history" className="action-card">
                        <div className="action-icon">📊</div>
                        <h3>View History</h3>
                        <p>Browse all processed samples and their blockchain trails</p>
                        <span className="btn btn-secondary">View All</span>
                    </Link>
                </div>

                {/* Recent Activity */}
                {samples.length > 0 && (
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)', marginBottom: '20px' }}>
                            <Clock size={20} style={{ marginRight: '10px' }} /> Recent Activity
                        </h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Sample ID</th>
                                    <th>Patient ID</th>
                                    <th>Status</th>
                                    <th>Risk</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {samples.slice(-5).reverse().map((sample) => (
                                    <tr key={sample.sampleId}>
                                        <td style={{ fontFamily: 'Space Mono' }}>{sample.sampleId}</td>
                                        <td>{sample.patientId}</td>
                                        <td>
                                            <span className={`badge ${sample.status === 'completed' ? 'badge-success' : sample.status === 'sequenced' ? 'badge-info' : 'badge-warning'}`}>
                                                {sample.status}
                                            </span>
                                        </td>
                                        <td>
                                            {sample.riskScore !== undefined ? (
                                                <span className={`badge ${sample.riskScore >= 70 ? 'badge-danger' : sample.riskScore >= 30 ? 'badge-warning' : 'badge-success'}`}>
                                                    {sample.riskScore >= 70 ? 'High' : sample.riskScore >= 30 ? 'Medium' : 'Low'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {sample.status === 'sequenced' ? (
                                                <Link to="/lab/analyze" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                                    <Brain size={12} /> Analyze
                                                </Link>
                                            ) : sample.status !== 'completed' ? (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>In Progress</span>
                                            ) : (
                                                <span className="badge badge-success">Complete</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pending Alerts */}
                {pendingCount > 0 && (
                    <div style={{ marginTop: '20px', padding: '15px 20px', background: 'rgba(255,200,0,0.1)', border: '1px solid var(--warning)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                        <div>
                            <strong style={{ color: 'var(--warning)' }}>{pendingCount} samples pending analysis</strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Go to AI Analysis to process sequenced samples</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabDashboard;
