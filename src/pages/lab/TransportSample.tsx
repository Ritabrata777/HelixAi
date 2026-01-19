import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Hash } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';

const TransportSample: React.FC = () => {
    const { samples, recordTransport, isLoading } = useBlockchain();
    const { showSuccess, showError } = useToast();
    const [selectedSample, setSelectedSample] = useState<string>('');
    const [logisticsId, setLogisticsId] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ sampleId: string; } | null>(null);

    const collectedSamples = samples.filter(s => s.status === 'collected');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSample || !logisticsId || !pickupLocation || !deliveryLocation) {
            showError('Please fill all fields and select a sample.');
            return;
        }

        setIsSubmitting(true);
        try {
            await recordTransport(selectedSample, logisticsId, pickupLocation, deliveryLocation);
            setResult({ sampleId: selectedSample });
            showSuccess('Sample transport recorded successfully!');
        } catch (error: any) {
            console.error(error);
            showError(error.message || 'Failed to record transport.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedSample('');
        setLogisticsId('');
        setPickupLocation('');
        setDeliveryLocation('');
        setResult(null);
    };

    if (result) {
        return (
            <div className="portal-page">
                <Navbar portal="lab" />
                <div className="portal-container">
                    <div className="form-card" style={{ textAlign: 'center', padding: '50px' }}>
                        <CheckCircle size={80} style={{ color: 'var(--success)', marginBottom: '20px' }} />
                        <h2 style={{ fontFamily: 'Orbitron', color: 'var(--success)', marginBottom: '10px' }}>Transport Recorded!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                            Blockchain Hash #2 generated successfully for sample {result.sampleId}.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={resetForm} className="btn btn-primary">Record Another</button>
                            <Link to="/lab/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">
                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(0,255,200,0.1), rgba(100,50,255,0.05))' }}>
                    <h2>🚚 Step 2: Transport</h2>
                    <p>Record the logistics details for a collected sample to generate blockchain Hash #2.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {/* Sample Selection */}
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                            Select Collected Sample
                        </h3>
                        {collectedSamples.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {collectedSamples.map(s => (
                                    <button key={s.sampleId} onClick={() => setSelectedSample(s.sampleId)}
                                        style={{
                                            padding: '15px', background: selectedSample === s.sampleId ? 'rgba(0,255,200,0.1)' : 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${selectedSample === s.sampleId ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '10px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)'
                                        }}>
                                        <div style={{ fontFamily: 'Space Mono', marginBottom: '5px' }}>{s.sampleId}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {s.status}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                <p>No samples are awaiting transport.</p>
                                <Link to="/lab/scan" className="btn btn-secondary" style={{ marginTop: '15px' }}>Scan a New Sample</Link>
                            </div>
                        )}
                    </div>

                    {/* Transport Form */}
                    <div className="form-card">
                        <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                            Transport Details
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Logistics ID</label>
                                <input type="text" className="form-input" value={logisticsId} onChange={(e) => setLogisticsId(e.target.value)}
                                    placeholder="e.g., FEDEX-123" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><MapPin size={14} style={{ marginRight: '5px' }} /> Pickup Location</label>
                                <input type="text" className="form-input" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                                    placeholder="Clinic name or address" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><MapPin size={14} style={{ marginRight: '5px' }} /> Delivery Location</label>
                                <input type="text" className="form-input" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)}
                                    placeholder="Lab address" required />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={!selectedSample || isSubmitting || isLoading}
                            >
                                <Hash size={18} style={{ marginRight: '8px' }} />
                                {isSubmitting || isLoading ? 'Processing...' : 'Generate Hash #2'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportSample;
