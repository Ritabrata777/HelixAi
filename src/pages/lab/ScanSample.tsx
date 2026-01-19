import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, MapPin, User, CheckCircle, Hash, Camera, Wallet } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { useWallet } from '../../context/WalletContext';
import Navbar from '../../components/Navbar';
import '../pages.css';

const ScanSample: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const [nurseId, setNurseId] = useState('');
    const [clinicLocation, setClinicLocation] = useState('');
    const [scanned, setScanned] = useState(false);
    const [result, setResult] = useState<{ sampleId: string; hash: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { recordCollection, isLoading } = useBlockchain();
    const { isConnected, isAmoyNetwork, connectWallet, switchToAmoy, isConnecting } = useWallet();


    const handleScan = () => {
        // Simulate QR code scan
        setScanned(true);
        setPatientId(`PAT-${Date.now().toString(36).toUpperCase()}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting || isLoading) {
            console.log('Submission already in progress, ignoring duplicate click');
            return;
        }

        if (!patientId || !nurseId || !clinicLocation) return;

        setIsSubmitting(true);
        try {
            const { sample, transaction } = await recordCollection(patientId, nurseId, clinicLocation);
            // Use blockchain transaction hash as proof (self-transfer to own account)
            // txHash is the blockchain transaction ID that serves as proof
            const proofHash = transaction.txHash || transaction.hash;
            setResult({ sampleId: sample.sampleId, hash: proofHash });
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to record sample on blockchain');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setPatientId('');
        setNurseId('');
        setClinicLocation('');
        setScanned(false);
        setResult(null);
    };

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">

                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(0,255,200,0.1), rgba(100,50,255,0.05))' }}>
                    <h2>🔬 Step 1: Collection</h2>
                    <p>Scan test tube QR code to register new sample and generate blockchain Hash #1</p>
                </div>

                {!result ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                        {/* QR Scanner */}
                        <div className="form-card">
                            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                                <QrCode size={20} style={{ marginRight: '10px' }} /> QR Code Scanner
                            </h3>

                            <div style={{
                                height: '250px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                                border: `2px dashed ${scanned ? 'var(--success)' : 'var(--accent-cyan)'}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s'
                            }}>
                                {scanned ? (
                                    <>
                                        <CheckCircle size={60} style={{ color: 'var(--success)', marginBottom: '15px' }} />
                                        <p style={{ color: 'var(--success)', fontFamily: 'Orbitron', fontSize: '1.1rem' }}>QR Code Scanned!</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient ID: {patientId}</p>
                                    </>
                                ) : (
                                    <>
                                        <Camera size={60} style={{ color: 'var(--accent-cyan)', marginBottom: '15px' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>Camera preview area</p>
                                    </>
                                )}
                            </div>

                            {!scanned && (
                                <button onClick={handleScan} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                                    <QrCode size={18} style={{ marginRight: '8px' }} /> Simulate QR Scan
                                </button>
                            )}
                        </div>

                        {/* Collection Form */}
                        <div className="form-card">
                            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                                <User size={20} style={{ marginRight: '10px' }} /> Collection Details
                            </h3>

                            <form onSubmit={handleSubmit}>
                                {/* Wallet Connection Status */}
                                <div style={{
                                    marginBottom: '20px',
                                    padding: '15px',
                                    background: isConnected && isAmoyNetwork ? 'rgba(0,255,150,0.1)' : 'rgba(255,165,0,0.1)',
                                    border: `1px solid ${isConnected && isAmoyNetwork ? 'rgba(0,255,150,0.3)' : 'rgba(255,165,0,0.3)'}`,
                                    borderRadius: '10px'
                                }}>
                                    {!isConnected ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ color: '#FFA500', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    <Wallet size={16} style={{ marginRight: '8px' }} />
                                                    Wallet Not Connected
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    Connect MetaMask to record on blockchain
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={connectWallet}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                disabled={isConnecting}
                                            >
                                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                                            </button>
                                        </div>
                                    ) : !isAmoyNetwork ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ color: '#FFA500', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    Wrong Network
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    Switch to Polygon Amoy Testnet
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={switchToAmoy}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                            >
                                                Switch Network
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle size={20} style={{ color: '#00ff96' }} />
                                            <div>
                                                <div style={{ color: '#00ff96', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    Ready for Blockchain
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    Connected to Polygon Amoy
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Patient ID</label>
                                    <input type="text" className="form-input" value={patientId} onChange={(e) => setPatientId(e.target.value)}
                                        placeholder="Scan QR or enter manually" required style={{ background: scanned ? 'rgba(0,255,150,0.1)' : undefined }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nurse ID</label>
                                    <input type="text" className="form-input" value={nurseId} onChange={(e) => setNurseId(e.target.value)}
                                        placeholder="Enter nurse/collector ID" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><MapPin size={14} style={{ marginRight: '5px' }} /> Clinic Location</label>
                                    <input type="text" className="form-input" value={clinicLocation} onChange={(e) => setClinicLocation(e.target.value)}
                                        placeholder="GPS coordinates or clinic name" required />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    disabled={!patientId || isSubmitting || isLoading || !isConnected || !isAmoyNetwork}
                                >
                                    <Hash size={18} style={{ marginRight: '8px' }} />
                                    {!isConnected ? 'Connect Wallet First' :
                                        !isAmoyNetwork ? 'Switch to Amoy Network' :
                                            isSubmitting || isLoading ? 'Processing...' : 'Generate Hash #1'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* Success Result */
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <CheckCircle size={80} style={{ color: 'var(--success)', marginBottom: '20px' }} />
                        <h2 style={{ fontFamily: 'Orbitron', color: 'var(--success)', marginBottom: '10px' }}>Sample Registered!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Blockchain Hash #1 generated successfully</p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '25px', marginBottom: '30px', textAlign: 'left' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sample ID</label>
                                <p style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', fontSize: '1.3rem' }}>{result.sampleId}</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <Hash size={12} /> Data Hash
                                </label>
                                <p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                    {result.hash && !result.hash.startsWith('0x') ? result.hash : 'Generated locally'}
                                </p>
                            </div>

                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <CheckCircle size={12} /> Blockchain Transaction
                                </label>
                                {result.hash && result.hash.startsWith('0x') ? (
                                    <a
                                        href={`https://amoy.polygonscan.com/tx/${result.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontFamily: 'Space Mono',
                                            color: 'var(--accent-cyan)',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                            textDecoration: 'none',
                                            display: 'block',
                                            marginTop: '5px'
                                        }}
                                    >
                                        {result.hash}
                                    </a>
                                ) : (
                                    <p style={{ fontFamily: 'Space Mono', color: 'var(--warning)', fontSize: '0.8rem', marginTop: '5px' }}>
                                        ⚠️ Verification Failed / Pending
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={resetForm} className="btn btn-primary">Scan Another Sample</button>
                            <Link to="/lab/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,255,200,0.05)', borderRadius: '12px', border: '1px solid rgba(0,255,200,0.2)' }}>
                    <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'Orbitron', fontSize: '0.9rem', marginBottom: '10px' }}>What happens next?</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        After collection, the sample moves to <strong>Step 2: Transport</strong> where logistics picks up the sample.
                        Hash #2 verifies custody transfer. Then to <strong>Step 3: Sequencing</strong> where the lab runs Low-Pass WGS.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScanSample;
