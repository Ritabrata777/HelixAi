const express = require('express');
const htmlPdf = require('html-pdf-node');
const router = express.Router();

// HTML template for medical report
const generateReportHTML = (data) => {
    const riskColor = data.riskScore >= 70 ? '#f44336' : data.riskScore >= 30 ? '#ff9800' : '#4caf50';
    const riskLevel = data.riskScore >= 70 ? 'HIGH RISK' : data.riskScore >= 30 ? 'MEDIUM RISK' : 'LOW RISK';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>HelixAI Medical Report</title>
        <style>
            @page { size: A4; margin: 20mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; }
            body { 
                font-family: 'Inter', 'Arial', sans-serif; 
                line-height: 1.5; 
                color: #222; 
                background: #fff;
                -webkit-print-color-adjust: exact; /* ensure background colors print */
            }
            .header {
                background: #5b3cff; /* solid, printer-friendly */
                color: white;
                padding: 20px 15px;
                text-align: center;
                margin-bottom: 18px;
            }
            .header h1 { font-size: 24px; margin-bottom: 6px; }
            .header p { font-size: 12px; opacity: 0.95; }
            .container { max-width: 750px; margin: 0 auto; padding: 0 12px; }
            .report-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
                border-left: 4px solid #6432ff;
            }
            .risk-section {
                text-align: center;
                margin: 22px 0;
                padding: 18px;
                background: #fafafa;
                border-radius: 10px;
                break-inside: avoid;
            }
            .risk-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: ${riskColor};
                color: white;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 12px;
            }
            .risk-score { font-size: 32px; font-weight: bold; }
            .risk-label { font-size: 12px; margin-top: 5px; }
            .section {
                margin: 30px 0;
                padding: 20px;
                border-radius: 10px;
                background: #fff;
                border: 1px solid #e0e0e0;
                break-inside: avoid;
            }
            .section h3 {
                color: #6432ff;
                margin-bottom: 15px;
                font-size: 18px;
                border-bottom: 2px solid #6432ff;
                padding-bottom: 5px;
            }
            .clinical-data {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }
            .data-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .data-label { font-weight: bold; color: #555; }
            .recommendations ul { list-style: none; }
            .recommendations li {
                padding: 8px 0;
                padding-left: 20px;
                position: relative;
            }
            .recommendations li:before {
                content: "→";
                position: absolute;
                left: 0;
                color: #6432ff;
                font-weight: bold;
            }
            .blockchain-section {
                background: #f7fffb;
                border: 1px solid #00c9a4;
                border-radius: 8px;
                padding: 14px;
                margin: 20px 0;
                break-inside: avoid;
            }
            .blockchain-section h3 { color: #00ffc8; }
            .tx-hash {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                word-break: break-all;
                background: rgba(0,0,0,0.1);
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #eee;
                margin-top: 40px;
            }
            .alert-section {
                background: rgba(255,165,0,0.1);
                border: 1px solid #ffa500;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .alert-section h4 { color: #ffa500; margin-bottom: 10px; }
            .risk-factors {
                background: rgba(255,0,0,0.1);
                border: 1px solid #ff6b6b;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .risk-factors h4 { color: #ff6b6b; margin-bottom: 10px; }
            .confidence-bar {
                width: 100%;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin: 10px 0;
            }
            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #4caf50, #8bc34a);
                width: ${data.confidence ? (data.confidence * 100) : 0}%;
                transition: width 0.3s ease;
            }
            img { max-width: 100%; height: auto; }
            .page-break { page-break-after: always; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧬 HelixAI Medical Report</h1>
            <p>AI-Powered Lung Cancer Risk Analysis • Blockchain Verified</p>
        </div>
        
        <div class="container">
            <div class="report-info">
                <h2>Sample Information</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px;">
                    <div>
                        <strong>Sample ID:</strong> ${data.sampleId}<br>
                        <strong>Patient ID:</strong> ${data.patientId}<br>
                        <strong>Report Date:</strong> ${new Date(data.completedAt || data.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Analysis Type:</strong> AI-Enhanced Risk Assessment<br>
                        <strong>Status:</strong> Completed<br>
                        ${data.urgency ? `<strong>Priority:</strong> ${data.urgency}` : ''}
                    </div>
                </div>
            </div>

            <div class="risk-section">
                <div class="risk-circle">
                    <div class="risk-score">${data.riskScore}%</div>
                    <div class="risk-label">${riskLevel}</div>
                </div>
                <h3>Risk Assessment Result</h3>
                ${data.confidence ? `
                <div style="margin: 15px 0;">
                    <p><strong>Model Confidence: ${(data.confidence * 100).toFixed(1)}%</strong></p>
                    <div class="confidence-bar">
                        <div class="confidence-fill"></div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${data.is_uncertain ? `
            <div class="alert-section">
                <h4>⚠️ High Uncertainty Detected</h4>
                <p>The AI model has detected high uncertainty in this analysis. Expert medical review is strongly recommended for accurate interpretation.</p>
            </div>
            ` : ''}

            <div class="section">
                <h3>🤖 AI Analysis</h3>
                <p>${data.analysis}</p>
            </div>

            ${data.risk_factors && data.risk_factors.length > 0 ? `
            <div class="risk-factors">
                <h4>🚨 Identified Risk Factors</h4>
                <ul>
                    ${data.risk_factors.map(factor => `<li>• ${factor}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${data.clinical_alerts && data.clinical_alerts.length > 0 ? `
            <div class="alert-section">
                <h4>⚠️ Clinical Alerts</h4>
                <ul>
                    ${data.clinical_alerts.map(alert => `<li>⚠ ${alert}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="section recommendations">
                <h3>📋 Recommendations</h3>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>🧪 Clinical Data Summary</h3>
                <div class="clinical-data">
                    ${data.age ? `<div class="data-item"><span class="data-label">Age:</span><span>${data.age}</span></div>` : ''}
                    ${data.sex ? `<div class="data-item"><span class="data-label">Sex:</span><span>${data.sex}</span></div>` : ''}
                    ${data.smokingStatus ? `<div class="data-item"><span class="data-label">Smoking Status:</span><span>${data.smokingStatus}</span></div>` : ''}
                    ${data.cfDNATotal ? `<div class="data-item"><span class="data-label">cfDNA Total:</span><span>${data.cfDNATotal} ng/mL</span></div>` : ''}
                    ${data.fragmentScore ? `<div class="data-item"><span class="data-label">Fragment Score:</span><span>${data.fragmentScore}</span></div>` : ''}
                    ${data.tp53Mut ? `<div class="data-item"><span class="data-label">TP53 Mutation:</span><span>${data.tp53Mut === '1' ? 'Detected' : 'Not Detected'}</span></div>` : ''}
                    ${data.krasMut ? `<div class="data-item"><span class="data-label">KRAS Mutation:</span><span>${data.krasMut === '1' ? 'Detected' : 'Not Detected'}</span></div>` : ''}
                    ${data.cea ? `<div class="data-item"><span class="data-label">CEA Level:</span><span>${data.cea} ng/mL</span></div>` : ''}
                    ${data.bmi ? `<div class="data-item"><span class="data-label">BMI:</span><span>${data.bmi}</span></div>` : ''}
                </div>
            </div>

            <div class="blockchain-section">
                <h3>🔗 Blockchain Verification</h3>
                <p><strong>This report is cryptographically secured and verified on the blockchain.</strong></p>
                ${data.txHashes && data.txHashes.length > 0 ? `
                <div>
                    <p style="margin: 10px 0;"><strong>Latest Transaction Hash:</strong></p>
                    <div class="tx-hash">${data.txHashes[data.txHashes.length - 1]}</div>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">
                        Verify on PolygonScan: https://amoy.polygonscan.com/tx/${data.txHashes[data.txHashes.length - 1]}
                    </p>
                </div>
                ` : `
                <p style="font-style: italic; color: #666;">Blockchain verification pending...</p>
                `}
            </div>

            <div class="footer">
                <p><strong>HelixAI Medical Report</strong> • Generated on ${new Date().toLocaleString()}</p>
                <p>This report is for informational purposes only and should not replace professional medical advice.</p>
                <p>🔒 Blockchain Verified • 🤖 AI-Powered Analysis • 🧬 Precision Medicine</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Generate PDF report endpoint
router.post('/generate-report', async (req, res) => {
    try {
        const reportData = req.body;
        
        if (!reportData.sampleId || !reportData.patientId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: sampleId and patientId' 
            });
        }

        const html = generateReportHTML(reportData);
        
        const options = {
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            paginationOffset: 1,
            header: {
                height: '15mm',
                contents: '<div style="text-align: center; color: #666; font-size: 10px;">HelixAI Medical Report - Confidential</div>'
            },
            footer: {
                height: '15mm',
                contents: {
                    default: '<div style="text-align: center; color: #666; font-size: 10px;">Page {{page}} of {{pages}} • Generated {{date}}</div>'
                }
            }
        };

        const file = { content: html };
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        
        const filename = `HelixAI_Report_${reportData.sampleId}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate PDF report',
            details: error.message 
        });
    }
});

// Generate batch reports endpoint
router.post('/generate-batch', async (req, res) => {
    try {
        const { samples } = req.body;
        
        if (!samples || !Array.isArray(samples) || samples.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No samples provided for batch generation' 
            });
        }

        const reports = [];
        
        for (const sample of samples) {
            try {
                const html = generateReportHTML(sample);
                const file = { content: html };
                const pdfBuffer = await htmlPdf.generatePdf(file, {
                    format: 'A4',
                    border: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
                });
                
                reports.push({
                    sampleId: sample.sampleId,
                    filename: `HelixAI_Report_${sample.sampleId}.pdf`,
                    buffer: pdfBuffer.toString('base64')
                });
            } catch (error) {
                console.error(`Error generating PDF for sample ${sample.sampleId}:`, error);
                reports.push({
                    sampleId: sample.sampleId,
                    error: error.message
                });
            }
        }
        
        res.json({ 
            success: true, 
            reports,
            generated: reports.filter(r => !r.error).length,
            failed: reports.filter(r => r.error).length
        });
        
    } catch (error) {
        console.error('Batch PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate batch PDF reports',
            details: error.message 
        });
    }
});

module.exports = router;