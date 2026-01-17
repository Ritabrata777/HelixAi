import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
    sampleId: string;
    patientId: string;
    riskScore: number;
    analysis: string;
    recommendations: string[];
    createdAt: string;
    completedAt?: string;
    txHashes?: string[];
    // Clinical data
    age?: string;
    sex?: string;
    smokingStatus?: string;
    cfDNATotal?: string;
    fragmentScore?: string;
    tp53Mut?: string;
    krasMut?: string;
    cea?: string;
    bmi?: string;
    // Enhanced ML results
    confidence?: number;
    uncertainty?: number;
    is_uncertain?: boolean;
    risk_factors?: string[];
    clinical_alerts?: string[];
    urgency?: string;
}

export class PDFGenerator {
    private doc: jsPDF;
    private pageHeight: number;
    private pageWidth: number;
    private margin: number;
    private currentY: number;

    constructor() {
        this.doc = new jsPDF();
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.margin = 20;
        this.currentY = this.margin;
    }

    private addHeader() {
        // Logo/Header area
        this.doc.setFillColor(100, 50, 255);
        this.doc.rect(0, 0, this.pageWidth, 30, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('HelixAI Medical Report', this.margin, 20);
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('AI-Powered Lung Cancer Risk Analysis', this.pageWidth - this.margin - 60, 20);
        
        this.currentY = 45;
    }

    private addFooter(pageNum: number) {
        const footerY = this.pageHeight - 15;
        
        this.doc.setTextColor(128, 128, 128);
        this.doc.setFontSize(8);
        this.doc.text(`Generated on ${new Date().toLocaleString()}`, this.margin, footerY);
        this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin - 15, footerY);
        
        // Blockchain verification footer
        this.doc.text('🔗 Blockchain Verified Report', this.pageWidth / 2 - 30, footerY);
    }

    private checkPageBreak(requiredSpace: number = 20): boolean {
        if (this.currentY + requiredSpace > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
            return true;
        }
        return false;
    }

    private addSection(title: string, content: string | string[], isRisk: boolean = false) {
        this.checkPageBreak(30);
        
        // Section title
        this.doc.setTextColor(100, 50, 255);
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;
        
        // Section content
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                this.checkPageBreak(8);
                this.doc.text(`• ${item}`, this.margin + 5, this.currentY);
                this.currentY += 6;
            });
        } else {
            const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin);
            lines.forEach((line: string) => {
                this.checkPageBreak(8);
                this.doc.text(line, this.margin, this.currentY);
                this.currentY += 6;
            });
        }
        
        this.currentY += 5;
    }

    private addRiskScoreVisual(riskScore: number) {
        this.checkPageBreak(60);
        
        const centerX = this.pageWidth / 2;
        const circleRadius = 25;
        
        // Risk circle background
        this.doc.setFillColor(240, 240, 240);
        this.doc.circle(centerX, this.currentY + circleRadius, circleRadius, 'F');
        
        // Risk circle color based on score
        let riskColor: [number, number, number] = [76, 175, 80]; // Green
        if (riskScore >= 70) riskColor = [244, 67, 54]; // Red
        else if (riskScore >= 30) riskColor = [255, 152, 0]; // Orange
        
        this.doc.setFillColor(...riskColor);
        this.doc.circle(centerX, this.currentY + circleRadius, circleRadius - 3, 'F');
        
        // Risk score text
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${riskScore}%`, centerX - 12, this.currentY + circleRadius + 2);
        
        // Risk level text
        this.doc.setFontSize(10);
        const riskLevel = riskScore >= 70 ? 'HIGH RISK' : riskScore >= 30 ? 'MEDIUM RISK' : 'LOW RISK';
        this.doc.text(riskLevel, centerX - 15, this.currentY + circleRadius + 12);
        
        this.currentY += circleRadius * 2 + 20;
    }

    private addClinicalData(data: ReportData) {
        this.checkPageBreak(80);
        
        this.doc.setTextColor(100, 50, 255);
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Clinical Data Summary', this.margin, this.currentY);
        this.currentY += 15;
        
        // Create a table-like structure
        const clinicalData = [
            ['Age', data.age || 'N/A'],
            ['Sex', data.sex || 'N/A'],
            ['Smoking Status', data.smokingStatus || 'N/A'],
            ['cfDNA Total', data.cfDNATotal ? `${data.cfDNATotal} ng/mL` : 'N/A'],
            ['Fragment Score', data.fragmentScore || 'N/A'],
            ['TP53 Mutation', data.tp53Mut === '1' ? 'Detected' : 'Not Detected'],
            ['KRAS Mutation', data.krasMut === '1' ? 'Detected' : 'Not Detected'],
            ['CEA Level', data.cea ? `${data.cea} ng/mL` : 'N/A'],
            ['BMI', data.bmi || 'N/A']
        ];
        
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        clinicalData.forEach(([label, value]) => {
            this.checkPageBreak(8);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${label}:`, this.margin, this.currentY);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(value, this.margin + 50, this.currentY);
            this.currentY += 8;
        });
        
        this.currentY += 10;
    }

    private addBlockchainVerification(data: ReportData) {
        this.checkPageBreak(40);
        
        // Blockchain section with border
        this.doc.setDrawColor(0, 255, 200);
        this.doc.setLineWidth(1);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35);
        
        this.doc.setTextColor(0, 255, 200);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('🔗 Blockchain Verification', this.margin + 5, this.currentY + 10);
        
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        if (data.txHashes && data.txHashes.length > 0) {
            const latestTx = data.txHashes[data.txHashes.length - 1];
            this.doc.text('Transaction Hash:', this.margin + 5, this.currentY + 20);
            this.doc.setFont('courier', 'normal');
            this.doc.text(latestTx, this.margin + 5, this.currentY + 28);
        } else {
            this.doc.text('Blockchain verification pending...', this.margin + 5, this.currentY + 20);
        }
        
        this.currentY += 45;
    }

    public async generateReport(data: ReportData): Promise<void> {
        // Page 1: Header and Overview
        this.addHeader();
        
        // Sample Information
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Sample ID: ${data.sampleId}`, this.margin, this.currentY);
        this.currentY += 10;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Patient ID: ${data.patientId}`, this.margin, this.currentY);
        this.currentY += 8;
        this.doc.text(`Report Date: ${new Date(data.completedAt || data.createdAt).toLocaleDateString()}`, this.margin, this.currentY);
        this.currentY += 15;
        
        // Risk Score Visual
        this.addRiskScoreVisual(data.riskScore);
        
        // AI Analysis
        this.addSection('AI Analysis Result', data.analysis);
        
        // Enhanced ML Features
        if (data.confidence !== undefined) {
            this.addSection('Model Confidence', `${(data.confidence * 100).toFixed(1)}%`);
        }
        
        if (data.is_uncertain) {
            this.doc.setTextColor(255, 165, 0);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('⚠️ HIGH UNCERTAINTY DETECTED - Expert review recommended', this.margin, this.currentY);
            this.currentY += 10;
        }
        
        // Risk Factors
        if (data.risk_factors && data.risk_factors.length > 0) {
            this.addSection('🚨 Identified Risk Factors', data.risk_factors);
        }
        
        // Clinical Alerts
        if (data.clinical_alerts && data.clinical_alerts.length > 0) {
            this.addSection('⚠️ Clinical Alerts', data.clinical_alerts);
        }
        
        // Recommendations
        this.addSection('Recommendations', data.recommendations);
        
        // Clinical Data
        this.addClinicalData(data);
        
        // Blockchain Verification
        this.addBlockchainVerification(data);
        
        // Footer
        this.addFooter(1);
        
        // Download the PDF
        this.doc.save(`HelixAI_Report_${data.sampleId}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    public async generateFromElement(elementId: string, filename: string): Promise<void> {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with ID ${elementId} not found`);
        }

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        this.doc = new jsPDF('p', 'mm', 'a4');
        let position = 0;

        this.doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            this.doc.addPage();
            this.doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        this.doc.save(filename);
    }
}

// Utility function to generate PDF from sample data
export const generateSampleReport = async (sample: any) => {
    const generator = new PDFGenerator();
    await generator.generateReport({
        sampleId: sample.sampleId,
        patientId: sample.patientId,
        riskScore: sample.riskScore || 0,
        analysis: sample.analysisResult || 'Analysis pending',
        recommendations: sample.recommendations || [],
        createdAt: sample.createdAt,
        completedAt: sample.completedAt,
        txHashes: sample.txHashes,
        // Add any additional clinical data if available
        age: sample.clinicalData?.age,
        sex: sample.clinicalData?.sex,
        smokingStatus: sample.clinicalData?.smokingStatus,
        cfDNATotal: sample.clinicalData?.cfDNATotal,
        fragmentScore: sample.clinicalData?.fragmentScore,
        tp53Mut: sample.clinicalData?.tp53Mut,
        krasMut: sample.clinicalData?.krasMut,
        cea: sample.clinicalData?.cea,
        bmi: sample.clinicalData?.bmi,
        confidence: sample.mlResults?.confidence,
        uncertainty: sample.mlResults?.uncertainty,
        is_uncertain: sample.mlResults?.is_uncertain,
        risk_factors: sample.mlResults?.risk_factors,
        clinical_alerts: sample.mlResults?.clinical_alerts,
        urgency: sample.mlResults?.urgency
    });
};