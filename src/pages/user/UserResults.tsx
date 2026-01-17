import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { pdfService } from '../../services/pdfService';
import Navbar from '../../components/Navbar';
import '../pages.css';

const UserResults: React.FC = () => {
    const { samples } = useBlockchain();
    const completedSamples = samples.filter(s => s.status === 'completed');

    const getRiskColor = (score: number) => {
        if (score < 30) return 'var(--success)';
        if (score < 70) return 'var(--warning)';
        return 'var(--danger)';
    };

    const getRiskLevel = (score: number) => {
        if (score < 30) return 'Low';
        if (score < 70) return 'Medium';
        return 'High';
    };

    const handleDownloadReport = async (sample: any) => {
        try {
            await pdfService.generateReport(sample, { method: 'client' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report. Please try again.');
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container">

                <div className="welcome-card">
                    <h2>📊 Your Results</h2>
                    <p>View your AI-generated risk reports with blockchain verification</p>
                </div>

                {completedSamples.length === 0 ? (
                    <div className="form-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <FileText size={70} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>No Results Yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your completed analyses will appear here once processed</p>
                        <Link to="/user/track" className="btn btn-secondary">Track a Sample</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {completedSamples.map((sample) => (
                            <div key={sample.sampleId} className="form-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '5px' }}>{sample.sampleId}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Completed: {new Date(sample.completedAt || '').toLocaleString()}</p>
                                    </div>
                                    <span className="badge badge-success"><CheckCircle size={12} /> Verified</span>
                                </div>

                                {/* Risk Score */}
                                <div className="risk-score">
                                    <div className={`risk-circle ${getRiskLevel(sample.riskScore || 0).toLowerCase()}`}
                                        style={{ '--risk-color': getRiskColor(sample.riskScore || 0) } as React.CSSProperties}>
                                        <div className="risk-value" style={{ color: getRiskColor(sample.riskScore || 0) }}>{sample.riskScore}%</div>
                                        <div className="risk-label" style={{ color: getRiskColor(sample.riskScore || 0) }}>{getRiskLevel(sample.riskScore || 0)} Risk</div>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>AI Analysis Result</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{sample.analysisResult}</p>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {sample.recommendations && sample.recommendations.length > 0 && (
                                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                                        <h4 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            <AlertTriangle size={16} style={{ marginRight: '8px' }} /> Recommendations
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {sample.recommendations.map((rec, idx) => (
                                                <li key={idx} style={{ color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent-cyan)' }}>→</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Blockchain Verification */}
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,255,200,0.05)', borderRadius: '10px', border: '1px solid rgba(0,255,200,0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
                                        <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Blockchain Verified</span>
                                    </div>
                                    {sample.txHashes && sample.txHashes.length > 0 ? (
                                        <div style={{ fontFamily: 'Space Mono', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            <div style={{ marginBottom: '5px' }}>Final Transaction:</div>
                                            <a 
                                                href={`https://amoy.polygonscan.com/tx/${sample.txHashes[sample.txHashes.length - 1]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    color: 'var(--accent-cyan)', 
                                                    textDecoration: 'none',
                                                    wordBreak: 'break-all'
                                                }}
                                                title="View on PolygonScan"
                                            >
                                                {sample.txHashes[sample.txHashes.length - 1]}
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{ fontFamily: 'Space Mono', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            Blockchain verification pending...
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ flex: 1 }}
                                        onClick={() => handleDownloadReport(sample)}
                                    >
                                        <Download size={16} style={{ marginRight: '8px' }} /> Download Report
                                    </button>
                                    <Link to={`/user/track?id=${sample.sampleId}`} className="btn btn-secondary" style={{ flex: 1 }}>
                                        View Full Timeline
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserResults;
