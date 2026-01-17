import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Hash, CheckCircle, Loader, Package, Truck, Microscope, Brain } from 'lucide-react';
import { useBlockchain, Sample } from '../../context/BlockchainContext';
import Navbar from '../../components/Navbar';
import BlockchainTxLink from '../../components/BlockchainTxLink';
import '../pages.css';

const TrackSample: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [transactionId, setTransactionId] = useState<string>(searchParams.get('id') || '');
    const [foundSample, setFoundSample] = useState<Sample | null>(null);
    const [searching, setSearching] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { getSampleById, samples } = useBlockchain();

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setTransactionId(id);
            handleSearch(id);
        }
    }, [searchParams]);

    const handleSearch = (id?: string) => {
        const searchId = id || transactionId;
        if (!searchId.trim()) return;

        setSearching(true);
        setError('');

        setTimeout(() => {
            const sample = getSampleById(searchId);
            if (sample) {
                setFoundSample(sample);
            } else {
                setError('Sample not found. Please check your transaction ID.');
                setFoundSample(null);
            }
            setSearching(false);
        }, 800);
    };

    const getStepIcon = (step: number) => {
        const icons = [Package, Truck, Microscope, Brain];
        const Icon = icons[step - 1] || Package;
        return <Icon size={24} />;
    };

    const stepNames = ['Collection', 'Transport', 'Sequencing', 'AI Analysis'];
    const stepDescriptions = [
        'Nurse scans QR code. Hash #1 generated with timestamp, Patient ID, and GPS.',
        'Logistics pickup. Hash #2 verifies custody transfer.',
        'Lab runs Low-Pass WGS. Hash #3 records raw data checksum.',
        'AI processes data. Smart Contract triggers Risk Report.'
    ];

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container">

                <div className="welcome-card">
                    <h2>🔍 Track Your Sample</h2>
                    <p>Enter your transaction ID to view the blockchain-verified journey of your sample</p>
                </div>

                {/* Search Box */}
                <div className="form-card" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Transaction ID</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter sample ID (e.g., HELIX-XXXXX)"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button onClick={() => handleSearch()} className="btn btn-primary" disabled={searching} style={{ height: '52px' }}>
                            {searching ? <Loader className="spin" size={18} /> : <Search size={18} />}
                            <span style={{ marginLeft: '8px' }}>{searching ? 'Searching...' : 'Track'}</span>
                        </button>
                    </div>
                    {error && <p style={{ color: 'var(--danger)', marginTop: '15px', fontSize: '0.9rem' }}>{error}</p>}

                    {samples.length > 0 && !foundSample && (
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>Available samples:</p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {samples.map(s => (
                                    <button key={s.sampleId} onClick={() => { setTransactionId(s.sampleId); handleSearch(s.sampleId); }}
                                        style={{
                                            background: 'rgba(0,255,200,0.1)', border: '1px solid var(--accent-cyan)',
                                            color: 'var(--accent-cyan)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem'
                                        }}>
                                        {s.sampleId}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                {foundSample && (
                    <div className="form-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <div>
                                <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>Sample: {foundSample.sampleId}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status: <span className={`badge ${foundSample.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{foundSample.status}</span></p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>Step {foundSample.currentStep}/4</div>
                            </div>
                        </div>

                        <div className="tracking-timeline">
                            {[1, 2, 3, 4].map((step) => {
                                const timelineEntry = foundSample.timeline.find(t => t.step === step);
                                const isCompleted = step <= foundSample.currentStep;
                                const isActive = step === foundSample.currentStep;

                                return (
                                    <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                        <div className="timeline-icon">{getStepIcon(step)}</div>
                                        <div className="timeline-content">
                                            <h4>{stepNames[step - 1]}</h4>
                                            <p>{stepDescriptions[step - 1]}</p>
                                            {timelineEntry ? (
                                                <>
                                                    <div className="timeline-hash">
                                                        <Hash size={12} style={{ marginRight: '5px' }} />
                                                        <BlockchainTxLink 
                                                            txHash={timelineEntry.txHash} 
                                                            label=""
                                                            compact={true}
                                                        />
                                                    </div>
                                                    <div className="timeline-meta">
                                                        <span><Clock size={12} /> {new Date(timelineEntry.timestamp).toLocaleString()}</span>
                                                        {timelineEntry.details.clinicLocation && <span><MapPin size={12} /> {timelineEntry.details.clinicLocation}</span>}
                                                        {timelineEntry.details.labId && <span>Lab: {timelineEntry.details.labId}</span>}
                                                    </div>
                                                </>
                                            ) : (
                                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending...</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {foundSample.status === 'completed' && (
                            <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: 'rgba(0,255,150,0.05)', borderRadius: '12px', border: '1px solid var(--success)' }}>
                                <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: '10px' }} />
                                <h4 style={{ color: 'var(--success)', fontFamily: 'Orbitron' }}>Analysis Complete</h4>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Your AI-generated risk report is ready</p>
                                <Link to="/user/results" className="btn btn-primary">View Results</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackSample;
