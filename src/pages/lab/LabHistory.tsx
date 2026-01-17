import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Download, CheckCircle, Clock, AlertTriangle, FileDown } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { pdfService } from '../../services/pdfService';
import Navbar from '../../components/Navbar';
import '../pages.css';

const LabHistory: React.FC = () => {
    const { samples, transactions } = useBlockchain();
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

    const filteredSamples = samples.filter(sample => {
        const matchesFilter = filter === 'all' ||
            (filter === 'high-risk' && (sample.riskScore || 0) >= 70) ||
            (filter === 'completed' && sample.status === 'completed') ||
            (filter === 'pending' && sample.status !== 'completed');

        const matchesSearch = sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sample.patientId.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getRiskBadge = (score?: number) => {
        if (score === undefined) return <span className="badge badge-info">Pending</span>;
        if (score >= 70) return <span className="badge badge-danger">High Risk</span>;
        if (score >= 30) return <span className="badge badge-warning">Medium</span>;
        return <span className="badge badge-success">Low Risk</span>;
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle size={14} style={{ color: 'var(--success)' }} />;
        return <Clock size={14} style={{ color: 'var(--warning)' }} />;
    };

    const handleDownloadReport = async (sample: any) => {
        try {
            await pdfService.generateReport(sample, { method: 'client' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report. Please try again.');
        }
    };

    const handleBatchDownload = async () => {
        if (selectedSamples.length === 0) {
            alert('Please select samples to download');
            return;
        }

        setIsGeneratingBatch(true);
        try {
            const samplesToDownload = samples.filter(s => selectedSamples.includes(s.sampleId));
            const results = await pdfService.generateBatchReports(samplesToDownload, { method: 'server' });
            
            if (results.failed > 0) {
                alert(`Generated ${results.success} reports successfully. ${results.failed} failed.`);
            } else {
                alert(`Successfully generated ${results.success} PDF reports!`);
            }
            
            setSelectedSamples([]);
        } catch (error) {
            console.error('Batch download error:', error);
            alert('Error generating batch reports. Please try again.');
        } finally {
            setIsGeneratingBatch(false);
        }
    };

    const handleSelectSample = (sampleId: string) => {
        setSelectedSamples(prev => 
            prev.includes(sampleId) 
                ? prev.filter(id => id !== sampleId)
                : [...prev, sampleId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSamples.length === filteredSamples.length) {
            setSelectedSamples([]);
        } else {
            setSelectedSamples(filteredSamples.map(s => s.sampleId));
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">

                <div className="welcome-card">
                    <h2>📊 Sample History</h2>
                    <p>View all processed samples and their complete blockchain trails</p>
                </div>

                {/* Filters */}
                <div className="form-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label className="form-label">Search</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" className="form-input" style={{ paddingLeft: '45px' }}
                                    placeholder="Search by Sample ID or Patient ID" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="form-label"><Filter size={14} style={{ marginRight: '5px' }} /> Filter</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['all', 'completed', 'pending', 'high-risk'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        style={{
                                            padding: '10px 18px', borderRadius: '20px', cursor: 'pointer',
                                            background: filter === f ? 'var(--accent-cyan)' : 'transparent',
                                            color: filter === f ? 'var(--bg-primary)' : 'var(--text-muted)',
                                            border: `1px solid ${filter === f ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)'}`,
                                            fontFamily: 'Orbitron', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize'
                                        }}>
                                        {f.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {selectedSamples.length > 0 && (
                            <div>
                                <button 
                                    onClick={handleBatchDownload}
                                    disabled={isGeneratingBatch}
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FileDown size={16} />
                                    {isGeneratingBatch ? 'Generating...' : `Download ${selectedSamples.length} Reports`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="stat-card">
                        <div className="stat-value">{samples.length}</div>
                        <div className="stat-label">Total Samples</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{samples.filter(s => s.status === 'completed').length}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value danger">{samples.filter(s => (s.riskScore || 0) >= 70).length}</div>
                        <div className="stat-label">High Risk</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>{transactions.length}</div>
                        <div className="stat-label">Blockchain Txns</div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="form-card">
                    {filteredSamples.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSamples.length === filteredSamples.length && filteredSamples.length > 0}
                                                onChange={handleSelectAll}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </th>
                                        <th>Sample ID</th>
                                        <th>Patient ID</th>
                                        <th>Status</th>
                                        <th>Step</th>
                                        <th>Risk Level</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSamples.map((sample) => (
                                        <tr key={sample.sampleId}>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedSamples.includes(sample.sampleId)}
                                                    onChange={() => handleSelectSample(sample.sampleId)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ fontFamily: 'Space Mono', color: 'var(--accent-cyan)' }}>{sample.sampleId}</td>
                                            <td>{sample.patientId}</td>
                                            <td>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {getStatusIcon(sample.status)}
                                                    <span style={{ textTransform: 'capitalize' }}>{sample.status}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {[1, 2, 3, 4].map(step => (
                                                        <div key={step} style={{
                                                            width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: step <= sample.currentStep ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                                                            color: step <= sample.currentStep ? 'var(--bg-primary)' : 'var(--text-muted)'
                                                        }}>{step}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{getRiskBadge(sample.riskScore)}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(sample.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <Link to={`/user/track?id=${sample.sampleId}`} title="View Timeline"
                                                        style={{ color: 'var(--accent-cyan)', padding: '6px', background: 'rgba(0,255,200,0.1)', borderRadius: '6px' }}>
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button 
                                                        title="Download Report"
                                                        onClick={() => handleDownloadReport(sample)}
                                                        style={{ color: 'var(--text-muted)', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <AlertTriangle size={50} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                            <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>No Samples Found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {samples.length === 0 ? 'No samples have been processed yet' : 'No samples match your current filters'}
                            </p>
                            {samples.length === 0 && (
                                <Link to="/lab/scan" className="btn btn-primary" style={{ marginTop: '20px' }}>Scan First Sample</Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <div className="form-card" style={{ marginTop: '20px' }}>
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)', marginBottom: '20px' }}>
                            Recent Blockchain Transactions
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {transactions.slice(-10).reverse().map((tx) => (
                                <div key={tx.id} style={{
                                    padding: '15px', marginBottom: '10px', background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{tx.type}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(tx.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontFamily: 'Space Mono', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {tx.txHash ? (
                                            <>
                                                <span>Blockchain Tx: </span>
                                                <a 
                                                    href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                        color: 'var(--accent-cyan)', 
                                                        textDecoration: 'none',
                                                        wordBreak: 'break-all'
                                                    }}
                                                    title="View on PolygonScan"
                                                >
                                                    {tx.txHash}
                                                </a>
                                            </>
                                        ) : (
                                            <span style={{ fontStyle: 'italic' }}>Blockchain verification pending...</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabHistory;
