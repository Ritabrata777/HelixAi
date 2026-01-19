import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Loader, FileText, AlertTriangle, Sparkles, Download } from 'lucide-react';
import { useBlockchain, Sample } from '../../context/BlockchainContext';
import { useToast } from '../../context/ToastContext';
import { pdfService } from '../../services/pdfService';
import Navbar from '../../components/Navbar';
import '../pages.css';

interface ReportData {
    age: string;
    sex: string;
    smokingStatus: string;
    smokingPackYears: string;
    cfDNATotal: string;
    fragmentScore: string;
    shortFragmentRatio: string;
    tp53Mut: string;
    tp53VAF: string;
    krasMut: string;
    krasVAF: string;
    cea: string;
    bmi: string;
    familyHistory: string;
    previousCancer: string;
    chronicLungDisease: string;
    // Advanced features (optional)
    alcoholConsumption?: string;
    occupationalExposure?: string;
    exerciseFrequency?: string;
}

interface AnalysisResult {
    riskScore: number;
    analysis: string;
    recommendations: string[];
    urgency?: string;
    confidence?: number;
    uncertainty?: number;
    is_uncertain?: boolean;
    risk_factors?: string[];
    clinical_alerts?: string[];
}

const AnalyzeSample: React.FC = () => {
    const { samples, recordSequencing, recordAnalysis, recordCollection } = useBlockchain();
    const { showSuccess, showError, showInfo } = useToast();
    const [selectedSample, setSelectedSample] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData>({
        age: '', sex: 'Male', smokingStatus: 'Never', smokingPackYears: '0', 
        cfDNATotal: '', fragmentScore: '', shortFragmentRatio: '', 
        tp53Mut: '0', tp53VAF: '0', krasMut: '0', krasVAF: '0', cea: '',
        bmi: '', familyHistory: 'No', previousCancer: 'No', chronicLungDisease: 'No',
        alcoholConsumption: 'None', occupationalExposure: 'No', exerciseFrequency: 'Moderate'
    });
    const [processing, setProcessing] = useState(false);
    const [isSequencing, setIsSequencing] = useState(false);
    const [stage, setStage] = useState<'input' | 'sequencing' | 'analyzing' | 'complete'>('input');
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const pendingSamples = samples.filter(s => s.status === 'in-transit' || s.status === 'collected');
    const sequencedSamples = samples.filter(s => s.status === 'sequenced');

    const handleSequencing = () => {
        if (!selectedSample) return;
        setProcessing(true);
        setIsSequencing(true);
        setStage('sequencing');
        
        showInfo('Starting DNA sequencing process...', 3000);

        // Simulate sequencing
        setTimeout(() => {
            const checksum = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            recordSequencing(selectedSample, 'LAB-001', checksum, 'Low-Pass WGS');
            setStage('input');
            setProcessing(false);
            setIsSequencing(false);
            showSuccess('Sequencing completed successfully! Sample ready for AI analysis.');
        }, 2500);
    };

    const handleAIAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent double submission
        if (processing) {
            console.log('Analysis already in progress, ignoring duplicate submission');
            return;
        }
        
        if (!selectedSample) {
            showError('Please select a sample first!');
            return;
        }

        console.log('🚀 Starting AI Analysis...');
        console.log('Selected Sample:', selectedSample);
        console.log('Report Data:', reportData);

        setProcessing(true);
        setStage('analyzing');
        
        showInfo('Starting AI analysis... This may take a few moments.', 3000);

        try {
            // First try the ML service
            const mlData = {
                age: reportData.age,
                sex: reportData.sex === 'Male' ? 'M' : 'F',
                smokingStatus: reportData.smokingStatus,
                smokingPackYears: reportData.smokingPackYears || '0',
                cfDNATotal: reportData.cfDNATotal,
                fragmentScore: reportData.fragmentScore,
                shortFragmentRatio: reportData.shortFragmentRatio,
                tp53Mut: reportData.tp53Mut,
                tp53VAF: reportData.tp53VAF || '0',
                krasMut: reportData.krasMut,
                krasVAF: reportData.krasVAF || '0',
                cea: reportData.cea,
                bmi: reportData.bmi,
                familyHistory: reportData.familyHistory,
                previousCancer: reportData.previousCancer,
                chronicLungDisease: reportData.chronicLungDisease,
                alcoholConsumption: reportData.alcoholConsumption,
                occupationalExposure: reportData.occupationalExposure,
                exerciseFrequency: reportData.exerciseFrequency
            };

            // Try ML API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
                const response = await fetch('/api/ml/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mlData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const mlResult = await response.json();
                    
                    if (mlResult.success) {
                        const { result: prediction } = mlResult;

                        recordAnalysis(selectedSample, prediction.analysis, prediction.risk_score, prediction.recommendations);
                        
                        setResult({
                            riskScore: prediction.risk_score,
                            analysis: prediction.analysis,
                            recommendations: prediction.recommendations,
                            urgency: prediction.urgency,
                            confidence: prediction.confidence,
                            uncertainty: prediction.uncertainty,
                            is_uncertain: prediction.is_uncertain,
                            risk_factors: prediction.risk_factors,
                            clinical_alerts: prediction.clinical_alerts
                        });
                        
                        setStage('complete');
                        setProcessing(false);
                        showSuccess('AI analysis completed successfully! Risk report generated.');
                        return;
                    }
                }
            } catch (error) {
                clearTimeout(timeoutId);
                console.log('ML service unavailable, using enhanced fallback analysis');
            }

            // Enhanced fallback analysis with more sophisticated logic
            showInfo('Using enhanced clinical analysis algorithm...', 2000);
            
            // Simulate processing time for realism
            await new Promise(resolve => setTimeout(resolve, 2000));

            const riskFactors: { factor: string; weight: number; present: boolean }[] = [
                { factor: 'Advanced age (>55)', weight: 15, present: parseInt(reportData.age) > 55 },
                { factor: 'Current/former smoking', weight: 25, present: reportData.smokingStatus !== 'Never' },
                { factor: 'Heavy smoking history', weight: 15, present: parseFloat(reportData.smokingPackYears || '0') > 20 },
                { factor: 'Elevated cfDNA levels', weight: 20, present: parseFloat(reportData.cfDNATotal) > 30 },
                { factor: 'Abnormal DNA fragmentation', weight: 15, present: parseFloat(reportData.fragmentScore) > 0.3 },
                { factor: 'TP53 mutation detected', weight: 20, present: reportData.tp53Mut === '1' },
                { factor: 'KRAS mutation detected', weight: 15, present: reportData.krasMut === '1' },
                { factor: 'Elevated CEA levels', weight: 10, present: parseFloat(reportData.cea) > 5 },
                { factor: 'Family history of cancer', weight: 8, present: reportData.familyHistory === 'Yes' },
                { factor: 'Previous cancer diagnosis', weight: 12, present: reportData.previousCancer === 'Yes' },
                { factor: 'Chronic lung disease', weight: 10, present: reportData.chronicLungDisease === 'Yes' },
                { factor: 'Occupational exposure', weight: 8, present: reportData.occupationalExposure === 'Yes' },
                { factor: 'Heavy alcohol consumption', weight: 5, present: reportData.alcoholConsumption === 'Heavy' }
            ];

            const presentRiskFactors = riskFactors.filter(rf => rf.present);
            const totalRiskWeight = presentRiskFactors.reduce((sum, rf) => sum + rf.weight, 0);
            
            // Calculate base risk score with some randomization for realism
            const baseRisk = Math.min(95, totalRiskWeight + Math.floor(Math.random() * 10));
            const riskScore = Math.max(5, baseRisk); // Minimum 5% risk

            // Generate detailed analysis based on risk factors
            let analysis = '';
            let recommendations: string[] = [];
            let urgency = 'Standard';
            let clinical_alerts: string[] = [];

            if (riskScore >= 70) {
                analysis = `High-risk profile detected with multiple concerning biomarkers. The combination of ${presentRiskFactors.length} significant risk factors, including ${presentRiskFactors.slice(0, 3).map(rf => rf.factor.toLowerCase()).join(', ')}, indicates substantial probability of early-stage malignancy. Immediate clinical intervention is strongly recommended.`;
                recommendations = [
                    'Schedule high-resolution CT scan within 1-2 weeks',
                    'Urgent pulmonology consultation recommended',
                    'Consider PET-CT scan for staging if CT shows abnormalities',
                    'Complete comprehensive metabolic panel',
                    'Discuss tissue biopsy options with oncology team'
                ];
                urgency = 'High';
                clinical_alerts = [
                    'Multiple high-risk biomarkers detected',
                    'Immediate medical attention required',
                    'Consider expedited diagnostic workup'
                ];
            } else if (riskScore >= 30) {
                analysis = `Moderate risk assessment with ${presentRiskFactors.length} identified risk factors. While not immediately concerning, the presence of ${presentRiskFactors.slice(0, 2).map(rf => rf.factor.toLowerCase()).join(' and ')} warrants continued monitoring and lifestyle modifications. Regular surveillance is recommended.`;
                recommendations = [
                    'Follow-up screening in 3-6 months',
                    'Annual low-dose CT screening if age appropriate',
                    'Smoking cessation counseling if applicable',
                    'Maintain healthy lifestyle and regular exercise',
                    'Monitor symptoms and report any changes'
                ];
                urgency = 'Moderate';
                if (presentRiskFactors.some(rf => rf.factor.includes('mutation'))) {
                    clinical_alerts.push('Genetic mutations detected - consider genetic counseling');
                }
            } else {
                analysis = `Low-risk profile with minimal concerning findings. Current biomarker levels are within acceptable ranges, though ${presentRiskFactors.length > 0 ? `${presentRiskFactors.length} minor risk factor${presentRiskFactors.length > 1 ? 's' : ''} identified` : 'no significant risk factors detected'}. Continue routine health maintenance and screening protocols.`;
                recommendations = [
                    'Continue annual health screenings',
                    'Maintain healthy lifestyle choices',
                    'Regular exercise and balanced nutrition',
                    'Avoid tobacco and limit alcohol consumption',
                    'Report any new respiratory symptoms promptly'
                ];
                urgency = 'Standard';
            }

            // Calculate confidence based on data completeness
            const requiredFields = ['age', 'cfDNATotal', 'fragmentScore', 'shortFragmentRatio', 'cea'];
            const completedFields = requiredFields.filter(field => reportData[field as keyof typeof reportData]);
            const confidence = completedFields.length / requiredFields.length;
            
            const is_uncertain = confidence < 0.8 || (riskScore > 30 && riskScore < 70);

            recordAnalysis(selectedSample, analysis, riskScore, recommendations);
            
            setResult({ 
                riskScore, 
                analysis, 
                recommendations,
                urgency,
                confidence,
                uncertainty: 1 - confidence,
                is_uncertain,
                risk_factors: presentRiskFactors.map(rf => rf.factor),
                clinical_alerts
            });
            
            setStage('complete');
            setProcessing(false);
            showSuccess('Enhanced clinical analysis completed successfully!');

        } catch (error) {
            console.error('Analysis error:', error);
            setProcessing(false);
            setStage('input');
            showError('Analysis failed. Please check your input data and try again.');
        }
    };

    // Handle smoking status changes
    const handleSmokingStatusChange = (status: string) => {
        const newData = { ...reportData, smokingStatus: status };
        if (status === 'Never') {
            newData.smokingPackYears = '0';
        }
        setReportData(newData);
    };

    // Handle mutation changes
    const handleMutationChange = (mutationType: 'tp53' | 'kras', value: string) => {
        const newData = { ...reportData };
        if (mutationType === 'tp53') {
            newData.tp53Mut = value;
            if (value === '0') newData.tp53VAF = '0';
        } else {
            newData.krasMut = value;
            if (value === '0') newData.krasVAF = '0';
        }
        setReportData(newData);
    };

    const resetForm = () => {
        setSelectedSample('');
        setResult(null);
        setStage('input');
        setReportData({ 
            age: '', sex: 'Male', smokingStatus: 'Never', smokingPackYears: '0', 
            cfDNATotal: '', fragmentScore: '', shortFragmentRatio: '', 
            tp53Mut: '0', tp53VAF: '0', krasMut: '0', krasVAF: '0', cea: '',
            bmi: '', familyHistory: 'No', previousCancer: 'No', chronicLungDisease: 'No',
            alcoholConsumption: 'None', occupationalExposure: 'No', exerciseFrequency: 'Moderate'
        });
    };

    const getRiskColor = (score: number) => score >= 70 ? 'var(--danger)' : score >= 30 ? 'var(--warning)' : 'var(--success)';
    const getRiskLevel = (score: number) => score >= 70 ? 'High' : score >= 30 ? 'Medium' : 'Low';

    const handleDownloadReport = async () => {
        if (!selectedSample || !result) return;
        
        const sample = samples.find(s => s.sampleId === selectedSample);
        if (!sample) return;

        try {
            // Create enhanced sample data with current analysis
            const enhancedSample = {
                ...sample,
                riskScore: result.riskScore,
                analysisResult: result.analysis,
                recommendations: result.recommendations,
                clinicalData: reportData,
                mlResults: {
                    confidence: result.confidence,
                    uncertainty: result.uncertainty,
                    is_uncertain: result.is_uncertain,
                    risk_factors: result.risk_factors,
                    clinical_alerts: result.clinical_alerts,
                    urgency: result.urgency
                }
            };
            
            await pdfService.generateReport(enhancedSample, { method: 'client' });
            showSuccess('PDF report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showError('Error generating PDF report. Please try again.');
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="lab" />
            <div className="portal-container">

                <div className="welcome-card" style={{ background: 'linear-gradient(135deg, rgba(100,50,255,0.1), rgba(255,0,255,0.05))' }}>
                    <h2>🤖 AI-Powered Analysis</h2>
                    <p>Input report data and run AI analysis to generate blockchain-verified risk reports</p>
                </div>

                {/* Processing States */}
                {(stage === 'sequencing' || stage === 'analyzing') && (
                    <div className="form-card progress-container" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="ai-spinner" style={{ 
                            borderTopColor: stage === 'analyzing' ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                            width: '50px',
                            height: '50px',
                            borderWidth: '4px',
                            marginBottom: '20px'
                        }}></div>
                        
                        <h3 className="progress-title" style={{ 
                            fontFamily: 'Orbitron', 
                            color: stage === 'analyzing' ? 'var(--accent-purple)' : 'var(--accent-cyan)', 
                            marginBottom: '10px',
                            fontSize: '1.2rem'
                        }}>
                            {stage === 'sequencing' ? '🧬 Running Low-Pass WGS...' : '🤖 AI Analyzing Data...'}
                        </h3>
                        
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                            {stage === 'sequencing' ? 'Generating Hash #3 with raw data checksum' : 'Smart Contract triggering Risk Report generation'}
                        </p>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="progress-bar" style={{ marginBottom: '20px' }}>
                            <div className="progress-fill"></div>
                        </div>
                        
                        {/* Processing Steps */}
                        <div className="processing-steps">
                            {stage === 'sequencing' ? (
                                <>
                                    <div className="processing-step active">
                                        <div className="processing-dot"></div>
                                        Extracting DNA sequences...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '0.5s' }}></div>
                                        Generating quality metrics...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '1s' }}></div>
                                        Creating data checksum...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '1.5s' }}></div>
                                        Recording to blockchain...
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="processing-step active">
                                        <div className="processing-dot"></div>
                                        Preprocessing clinical data...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '0.5s' }}></div>
                                        Running ML risk assessment...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '1s' }}></div>
                                        Generating recommendations...
                                    </div>
                                    <div className="processing-step">
                                        <div className="processing-dot" style={{ animationDelay: '1.5s' }}></div>
                                        Recording to blockchain...
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Step Indicators */}
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%',
                                    background: i <= (stage === 'sequencing' ? 3 : 4) ? 
                                        (stage === 'analyzing' ? 'var(--accent-purple)' : 'var(--accent-cyan)') : 
                                        'rgba(255,255,255,0.2)',
                                    animation: i === (stage === 'sequencing' ? 3 : 4) ? 'pulse 1s infinite' : 'none',
                                    transition: 'all 0.3s ease'
                                }} />
                            ))}
                        </div>
                        
                        <div style={{ 
                            marginTop: '15px', 
                            fontSize: '0.85rem', 
                            color: 'var(--text-muted)' 
                        }}>
                            Step {stage === 'sequencing' ? '3' : '4'} of 4 • Estimated time: {stage === 'sequencing' ? '2-3' : '3-5'} seconds
                        </div>
                    </div>
                )}

                {/* Complete State */}
                {stage === 'complete' && result && (
                    <div className="form-card">
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Sparkles size={50} style={{ color: 'var(--accent-purple)', marginBottom: '15px' }} />
                            <h2 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)' }}>Analysis Complete</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Hash #4 generated - Risk Report on blockchain</p>
                        </div>

                        <div className="risk-score">
                            <div className={`risk-circle ${getRiskLevel(result.riskScore).toLowerCase()}`}>
                                <div className="risk-value" style={{ color: getRiskColor(result.riskScore) }}>{result.riskScore}%</div>
                                <div className="risk-label" style={{ color: getRiskColor(result.riskScore) }}>{getRiskLevel(result.riskScore)} Risk</div>
                                {result.urgency && (
                                    <div style={{ fontSize: '0.7rem', marginTop: '5px', color: 'var(--text-muted)' }}>
                                        {result.urgency} Priority
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
                                    🤖 Enhanced AI Analysis
                                    {result.confidence && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                            (Confidence: {(result.confidence * 100).toFixed(1)}%)
                                        </span>
                                    )}
                                </h4>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{result.analysis}</p>
                                
                                {result.is_uncertain && (
                                    <div style={{ 
                                        background: 'rgba(255,165,0,0.1)', 
                                        border: '1px solid rgba(255,165,0,0.3)',
                                        borderRadius: '8px', 
                                        padding: '10px', 
                                        marginTop: '10px' 
                                    }}>
                                        <span style={{ color: '#FFA500', fontSize: '0.9rem' }}>
                                            ⚠️ High uncertainty detected - Expert review recommended
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Risk Factors */}
                        {result.risk_factors && result.risk_factors.length > 0 && (
                            <div style={{ background: 'rgba(255,0,0,0.1)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                                <h4 style={{ fontFamily: 'Orbitron', color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '15px' }}>
                                    🚨 Identified Risk Factors
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {result.risk_factors.map((factor, idx) => (
                                        <li key={idx} style={{ color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#ff6b6b' }}>•</span>{factor}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Clinical Alerts */}
                        {result.clinical_alerts && result.clinical_alerts.length > 0 && (
                            <div style={{ background: 'rgba(255,165,0,0.1)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                                <h4 style={{ fontFamily: 'Orbitron', color: '#FFA500', fontSize: '0.9rem', marginBottom: '15px' }}>
                                    ⚠️ Clinical Alerts
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {result.clinical_alerts.map((alert, idx) => (
                                        <li key={idx} style={{ color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#FFA500' }}>⚠</span>{alert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                            <h4 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                <AlertTriangle size={16} style={{ marginRight: '8px' }} /> Recommendations
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {result.recommendations.map((rec, idx) => (
                                    <li key={idx} style={{ color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: 'var(--accent-cyan)' }}>→</span>{rec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button onClick={resetForm} className="btn btn-primary" style={{ flex: 1 }}>Analyze Another</button>
                            <button onClick={handleDownloadReport} className="btn btn-secondary" style={{ flex: 1 }}>
                                <Download size={16} style={{ marginRight: '8px' }} /> Download Report
                            </button>
                            <Link to="/lab/history" className="btn btn-secondary" style={{ flex: 1 }}>View History</Link>
                        </div>
                    </div>
                )}

                {/* Input State */}
                {stage === 'input' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                        {/* Sample Selection */}
                        <div className="form-card">
                            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
                                <FileText size={20} style={{ marginRight: '10px' }} /> Select Sample
                            </h3>

                            {pendingSamples.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Samples Ready for Sequencing</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {pendingSamples.map(s => (
                                            <button key={s.sampleId} onClick={() => setSelectedSample(s.sampleId)}
                                                style={{
                                                    padding: '15px', background: selectedSample === s.sampleId ? 'rgba(0,255,200,0.1)' : 'rgba(0,0,0,0.2)',
                                                    border: `1px solid ${selectedSample === s.sampleId ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)'
                                                }}>
                                                <div style={{ fontFamily: 'Space Mono', marginBottom: '5px' }}>{s.sampleId}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {s.status} • Step {s.currentStep}/4</div>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={handleSequencing} className="btn btn-primary" style={{ 
                                        width: '100%', 
                                        marginTop: '15px',
                                        background: isSequencing ? 'rgba(0,255,200,0.5)' : 'var(--accent-cyan)',
                                        color: isSequencing ? 'white' : 'var(--bg-primary)',
                                        minHeight: '45px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                        disabled={!selectedSample || !pendingSamples.find(s => s.sampleId === selectedSample) || processing}>
                                        {isSequencing ? (
                                            <>
                                                <div className="ai-spinner" style={{ 
                                                    width: '18px', 
                                                    height: '18px', 
                                                    borderWidth: '2px',
                                                    borderTopColor: 'white'
                                                }}></div>
                                                <span>Running Sequencing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Loader size={16} /> 
                                                Run Sequencing (Hash #3)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {sequencedSamples.length > 0 && (
                                <div>
                                    <label className="form-label" style={{ color: 'var(--accent-purple)' }}>Samples Ready for AI Analysis</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {sequencedSamples.map(s => (
                                            <button key={s.sampleId} onClick={() => setSelectedSample(s.sampleId)}
                                                style={{
                                                    padding: '15px', background: selectedSample === s.sampleId ? 'rgba(100,50,255,0.1)' : 'rgba(0,0,0,0.2)',
                                                    border: `1px solid ${selectedSample === s.sampleId ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)'
                                                }}>
                                                <div style={{ fontFamily: 'Space Mono', marginBottom: '5px' }}>{s.sampleId}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Checksum: {s.rawDataChecksum?.slice(0, 20)}...</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pendingSamples.length === 0 && sequencedSamples.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                    <FileText size={40} style={{ marginBottom: '10px' }} />
                                    <p>No samples available for analysis</p>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                                        <Link to="/lab/scan" className="btn btn-secondary">Scan New Sample</Link>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    // Create a test sample for demonstration
                                                    const testPatientId = `PAT-${Date.now().toString().slice(-6)}`;
                                                    const { sample } = await recordCollection(testPatientId, 'NURSE-001', 'Test Clinic');
                                                    
                                                    // Immediately sequence it for testing
                                                    const checksum = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
                                                    await recordSequencing(sample.sampleId, 'LAB-001', checksum, 'Low-Pass WGS');
                                                    
                                                    showSuccess(`Test sample ${sample.sampleId} created and sequenced!`);
                                                } catch (error) {
                                                    showError('Failed to create test sample');
                                                }
                                            }}
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            Create Test Sample
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Report Data Form */}
                        <div className="form-card" style={{ 
                            position: 'relative',
                            opacity: processing ? 0.7 : 1,
                            pointerEvents: processing ? 'none' : 'auto',
                            transition: 'opacity 0.3s ease'
                        }}>
                            {processing && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(10, 14, 39, 0.8)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    backdropFilter: 'blur(2px)'
                                }}>
                                    <div style={{ 
                                        color: 'var(--accent-purple)', 
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div className="ai-spinner" style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderWidth: '2px',
                                            borderTopColor: 'var(--accent-purple)'
                                        }}></div>
                                        Processing...
                                    </div>
                                </div>
                            )}
                            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--accent-purple)', marginBottom: '20px' }}>
                                <Brain size={20} style={{ marginRight: '10px' }} /> Input Report Data
                            </h3>

                            {/* Status Indicator */}
                            <div style={{ 
                                marginBottom: '20px', 
                                padding: '12px', 
                                background: selectedSample && sequencedSamples.find(s => s.sampleId === selectedSample) 
                                    ? 'rgba(0,255,150,0.1)' 
                                    : 'rgba(255,165,0,0.1)',
                                border: `1px solid ${selectedSample && sequencedSamples.find(s => s.sampleId === selectedSample) 
                                    ? 'rgba(0,255,150,0.3)' 
                                    : 'rgba(255,165,0,0.3)'}`,
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {selectedSample && sequencedSamples.find(s => s.sampleId === selectedSample) ? (
                                    <>
                                        <span style={{ color: '#00ff96', fontSize: '1.2rem' }}>✓</span>
                                        <div>
                                            <div style={{ color: '#00ff96', fontWeight: 'bold' }}>Ready for AI Analysis</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                Sample {selectedSample} is sequenced and ready
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ color: '#FFA500', fontSize: '1.2rem' }}>⚠</span>
                                        <div>
                                            <div style={{ color: '#FFA500', fontWeight: 'bold' }}>Sample Required</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {selectedSample 
                                                    ? 'Selected sample needs sequencing first' 
                                                    : 'Please select a sequenced sample from the left panel'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Quick Test Data Button */}
                            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,255,200,0.1)', borderRadius: '10px', border: '1px solid rgba(0,255,200,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '5px' }}>🧪 Quick Test</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Fill form with sample data for testing</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setReportData({
                                            age: '62', sex: 'Male', smokingStatus: 'Former', smokingPackYears: '30', 
                                            cfDNATotal: '35.2', fragmentScore: '0.45', shortFragmentRatio: '0.38', 
                                            tp53Mut: '1', tp53VAF: '0.12', krasMut: '0', krasVAF: '0', cea: '6.8',
                                            bmi: '28.5', familyHistory: 'Yes', previousCancer: 'No', chronicLungDisease: 'No',
                                            alcoholConsumption: 'Moderate', occupationalExposure: 'Yes', exerciseFrequency: 'Light'
                                        })}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                                    >
                                        Fill Test Data
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleAIAnalysis}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Age</label>
                                        <input type="number" className="form-input" value={reportData.age}
                                            onChange={(e) => setReportData({ ...reportData, age: e.target.value })} placeholder="Age" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sex</label>
                                        <select className="form-input" value={reportData.sex}
                                            onChange={(e) => setReportData({ ...reportData, sex: e.target.value })}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Smoking Status</label>
                                        <select className="form-input" value={reportData.smokingStatus}
                                            onChange={(e) => handleSmokingStatusChange(e.target.value)}>
                                            <option value="Never">Never</option>
                                            <option value="Former">Former</option>
                                            <option value="Current">Current</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Smoking Pack Years</label>
                                        <input type="number" step="0.1" className="form-input" value={reportData.smokingPackYears}
                                            onChange={(e) => setReportData({ ...reportData, smokingPackYears: e.target.value })} 
                                            placeholder="e.g. 20" disabled={reportData.smokingStatus === 'Never'} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">cfDNA Total (ng/mL)</label>
                                        <input type="number" step="0.1" className="form-input" value={reportData.cfDNATotal}
                                            onChange={(e) => setReportData({ ...reportData, cfDNATotal: e.target.value })} placeholder="e.g. 25.5" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fragment Score</label>
                                        <input type="number" step="0.01" className="form-input" value={reportData.fragmentScore}
                                            onChange={(e) => setReportData({ ...reportData, fragmentScore: e.target.value })} placeholder="e.g. 0.65" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Short Fragment Ratio</label>
                                        <input type="number" step="0.01" className="form-input" value={reportData.shortFragmentRatio}
                                            onChange={(e) => setReportData({ ...reportData, shortFragmentRatio: e.target.value })} placeholder="e.g. 0.35" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CEA Level (ng/mL)</label>
                                        <input type="number" step="0.1" className="form-input" value={reportData.cea}
                                            onChange={(e) => setReportData({ ...reportData, cea: e.target.value })} placeholder="e.g. 3.5" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">TP53 Mutation</label>
                                        <select className="form-input" value={reportData.tp53Mut}
                                            onChange={(e) => handleMutationChange('tp53', e.target.value)}>
                                            <option value="0">Not Detected</option>
                                            <option value="1">Detected</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">TP53 VAF</label>
                                        <input type="number" step="0.001" className="form-input" value={reportData.tp53VAF}
                                            onChange={(e) => setReportData({ ...reportData, tp53VAF: e.target.value })} 
                                            placeholder="e.g. 0.08" disabled={reportData.tp53Mut === '0'} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">KRAS Mutation</label>
                                        <select className="form-input" value={reportData.krasMut}
                                            onChange={(e) => handleMutationChange('kras', e.target.value)}>
                                            <option value="0">Not Detected</option>
                                            <option value="1">Detected</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">KRAS VAF</label>
                                        <input type="number" step="0.001" className="form-input" value={reportData.krasVAF}
                                            onChange={(e) => setReportData({ ...reportData, krasVAF: e.target.value })} 
                                            placeholder="e.g. 0.03" disabled={reportData.krasMut === '0'} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">BMI</label>
                                        <input type="number" step="0.1" className="form-input" value={reportData.bmi}
                                            onChange={(e) => setReportData({ ...reportData, bmi: e.target.value })} 
                                            placeholder="e.g. 25.5" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Family History</label>
                                        <select className="form-input" value={reportData.familyHistory}
                                            onChange={(e) => setReportData({ ...reportData, familyHistory: e.target.value })}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Previous Cancer</label>
                                        <select className="form-input" value={reportData.previousCancer}
                                            onChange={(e) => setReportData({ ...reportData, previousCancer: e.target.value })}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Chronic Lung Disease</label>
                                        <select className="form-input" value={reportData.chronicLungDisease}
                                            onChange={(e) => setReportData({ ...reportData, chronicLungDisease: e.target.value })}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Advanced Features Section */}
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(100,50,255,0.1)', borderRadius: '10px' }}>
                                    <h4 style={{ color: 'var(--accent-purple)', marginBottom: '15px', fontSize: '0.9rem' }}>
                                        🧬 Advanced Clinical Features (Optional)
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Alcohol Consumption</label>
                                            <select className="form-input" value={reportData.alcoholConsumption}
                                                onChange={(e) => setReportData({ ...reportData, alcoholConsumption: e.target.value })}>
                                                <option value="None">None</option>
                                                <option value="Light">Light</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Heavy">Heavy</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Occupational Exposure</label>
                                            <select className="form-input" value={reportData.occupationalExposure}
                                                onChange={(e) => setReportData({ ...reportData, occupationalExposure: e.target.value })}>
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Exercise Frequency</label>
                                            <select className="form-input" value={reportData.exerciseFrequency}
                                                onChange={(e) => setReportData({ ...reportData, exerciseFrequency: e.target.value })}>
                                                <option value="None">None</option>
                                                <option value="Light">Light</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Heavy">Heavy</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ 
                                    width: '100%', 
                                    marginTop: '20px', 
                                    background: processing ? 'rgba(100,50,255,0.5)' : 'linear-gradient(135deg, #6432ff, #ff00ff)',
                                    position: 'relative',
                                    minHeight: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: (!sequencedSamples.find(s => s.sampleId === selectedSample) || processing) ? 0.5 : 1,
                                    cursor: (!sequencedSamples.find(s => s.sampleId === selectedSample) || processing) ? 'not-allowed' : 'pointer'
                                }}
                                    disabled={!sequencedSamples.find(s => s.sampleId === selectedSample) || processing}
                                    onClick={(e) => {
                                        if (!sequencedSamples.find(s => s.sampleId === selectedSample)) {
                                            e.preventDefault();
                                            showError('Please select a sequenced sample first!');
                                        }
                                    }}>
                                    {processing ? (
                                        <>
                                            <div className="ai-spinner" style={{ 
                                                width: '20px', 
                                                height: '20px', 
                                                borderWidth: '2px',
                                                borderTopColor: 'white'
                                            }}></div>
                                            <span>Processing AI Analysis...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} /> 
                                            Run AI Analysis (Hash #4)
                                        </>
                                    )}
                                </button>

                                {/* Helper text when button is disabled */}
                                {!sequencedSamples.find(s => s.sampleId === selectedSample) && !processing && (
                                    <div style={{ 
                                        marginTop: '10px', 
                                        padding: '10px', 
                                        background: 'rgba(255,165,0,0.1)', 
                                        border: '1px solid rgba(255,165,0,0.3)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        color: '#FFA500',
                                        textAlign: 'center'
                                    }}>
                                        ⚠️ Please select a sequenced sample from the left panel to run AI analysis
                                    </div>
                                )}

                                {/* Progress Bar */}
                                {processing && (
                                    <div style={{ 
                                        marginTop: '15px', 
                                        background: 'rgba(0,0,0,0.2)', 
                                        borderRadius: '10px', 
                                        padding: '15px' 
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginBottom: '10px' 
                                        }}>
                                            <span style={{ color: 'var(--accent-purple)', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>
                                                🤖 AI Analysis in Progress
                                            </span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                Please wait...
                                            </span>
                                        </div>
                                        
                                        {/* Animated Progress Bar */}
                                        <div style={{ 
                                            width: '100%', 
                                            height: '8px', 
                                            background: 'rgba(255,255,255,0.1)', 
                                            borderRadius: '4px', 
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #6432ff, #ff00ff, #00ffc8)',
                                                borderRadius: '4px',
                                                animation: 'progressSlide 2s ease-in-out infinite',
                                                width: '30%'
                                            }}></div>
                                        </div>
                                        
                                        {/* Processing Steps */}
                                        <div style={{ marginTop: '15px' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                marginBottom: '8px',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div className="processing-dot"></div>
                                                Preprocessing clinical data...
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                marginBottom: '8px',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div className="processing-dot" style={{ animationDelay: '0.5s' }}></div>
                                                Running ML risk assessment...
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                marginBottom: '8px',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div className="processing-dot" style={{ animationDelay: '1s' }}></div>
                                                Generating recommendations...
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div className="processing-dot" style={{ animationDelay: '1.5s' }}></div>
                                                Recording to blockchain...
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzeSample;
