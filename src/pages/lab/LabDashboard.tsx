import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, AlertTriangle, Cpu, TestTube, BarChart3, QrCode, Truck, Bell } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LabDashboard: React.FC = () => {
    const { samples, transactions } = useBlockchain();
    const labName = localStorage.getItem('labName') || 'Lab Admin';
    const [pendingRequestCount, setPendingRequestCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await axios.get(`${API_URL}/test-requests/count`);
                setPendingRequestCount(res.data.count);
            } catch (err) {
                console.error('Error fetching pending count:', err);
            }
        };
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const highRiskCount = samples.filter(s => (s.riskScore || 0) >= 70).length;
    const pendingCount = samples.filter(s => s.status !== 'completed' && s.status !== 'collected').length;
    const awaitingTransportCount = samples.filter(s => s.status === 'collected').length;

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">

                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))' }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)' }}>Welcome, {labName}</h2>
                    <p>Manage patient diagnostics, run AI analysis, and monitor blockchain-verified sample data.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <TestTube size={24} className="stat-icon" style={{ color: 'var(--accent-purple)' }} />
                        <div>
                            <div className="stat-value">{samples.length}</div>
                            <div className="stat-label">Total Samples</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Bell size={24} className="stat-icon" style={{ color: pendingRequestCount > 0 ? 'var(--danger)' : 'var(--accent-cyan)' }} />
                        <div>
                            <div className="stat-value" style={{ color: pendingRequestCount > 0 ? 'var(--danger)' : 'var(--accent-cyan)' }}>{pendingRequestCount}</div>
                            <div className="stat-label">New Requests</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Clock size={24} className="stat-icon" style={{ color: 'var(--warning)' }} />
                        <div>
                            <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
                            <div className="stat-label">Pending Analysis</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <AlertTriangle size={24} className="stat-icon" style={{ color: 'var(--danger)' }} />
                        <div>
                            <div className="stat-value danger">{highRiskCount}</div>
                            <div className="stat-label">High Risk Cases</div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="action-grid">
                    <Link to="/lab/requests" className="action-card" style={{ position: 'relative' }}>
                        <div className="action-icon-wrapper" style={{ color: 'var(--danger)' }}>
                            <Bell />
                        </div>
                        {pendingRequestCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'var(--danger)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}>
                                {pendingRequestCount}
                            </div>
                        )}
                        <h3>Test Requests</h3>
                        <p>View and manage patient test requests. Accept or reject incoming requests.</p>
                        <span className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>View Requests</span>
                    </Link>
                    <Link to="/lab/scan" className="action-card">
                        <div className="action-icon-wrapper" style={{ color: 'var(--accent-cyan)' }}>
                            <QrCode />
                        </div>
                        <h3>Scan New Sample</h3>
                        <p>Register new samples and generate their initial blockchain record (Hash #1).</p>
                        <span className="btn btn-secondary" style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>Start Scanning</span>
                    </Link>
                    <Link to="/lab/transport" className="action-card">
                        <div className="action-icon-wrapper" style={{ color: 'var(--accent-purple)' }}>
                            <Truck />
                        </div>
                        <h3>Record Transport</h3>
                        <p>Logistics pickup details to verify custody transfer with Hash #2.</p>
                        <span className="btn btn-secondary" style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>Record Pickup</span>
                    </Link>
                    <Link to="/lab/analyze" className="action-card">
                        <div className="action-icon-wrapper" style={{ color: 'var(--accent-pink)' }}>
                            <Cpu />
                        </div>
                        <h3>AI Analysis</h3>
                        <p>Process sequenced data with the ML model to generate risk reports.</p>
                        <span className="btn btn-secondary" style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)' }}>Run Analysis</span>
                    </Link>
                </div>

                {/* Recent Activity */}
                {samples.length > 0 && (
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)', marginBottom: '20px' }}>
                            <Clock size={20} style={{ marginRight: '10px' }} /> Recent Activity
                        </h3>
                        <div className="table-responsive">
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
                                            <td data-label="Sample ID" style={{ fontFamily: 'Space Mono' }}>{sample.sampleId}</td>
                                            <td data-label="Patient ID">{sample.patientId}</td>
                                            <td data-label="Status">
                                                <span className={`badge ${sample.status === 'completed' ? 'badge-success' : sample.status === 'sequenced' ? 'badge-info' : 'badge-warning'}`}>
                                                    {sample.status}
                                                </span>
                                            </td>
                                            <td data-label="Risk">
                                                {sample.riskScore !== undefined ? (
                                                    <span className={`badge ${sample.riskScore >= 70 ? 'badge-danger' : sample.riskScore >= 30 ? 'badge-warning' : 'badge-success'}`}>
                                                        {sample.riskScore >= 70 ? 'High' : sample.riskScore >= 30 ? 'Medium' : 'Low'}
                                                    </span>
                                                ) : <span className="badge">N/A</span>}
                                            </td>
                                            <td data-label="Action">
                                                {sample.status === 'collected' ? (
                                                    <Link to="/lab/transport" className="btn btn-primary lab" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                                        <Truck size={12} /> Transport
                                                    </Link>
                                                ) : sample.status === 'sequenced' ? (
                                                    <Link to="/lab/analyze" className="btn btn-primary lab" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabDashboard;
