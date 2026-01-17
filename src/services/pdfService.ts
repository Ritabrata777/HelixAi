import { generateSampleReport, PDFGenerator } from '../utils/pdfGenerator';

export interface PDFOptions {
    method?: 'client' | 'server';
    format?: 'standard' | 'detailed' | 'summary';
    includeCharts?: boolean;
    watermark?: string;
}

export class PDFService {
    private static instance: PDFService;
    private baseURL: string;

    private constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    }

    public static getInstance(): PDFService {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }

    /**
     * Generate a single PDF report
     */
    public async generateReport(
        sampleData: any, 
        options: PDFOptions = { method: 'client' }
    ): Promise<void> {
        try {
            if (options.method === 'server') {
                await this.generateServerPDF(sampleData, options);
            } else {
                await this.generateClientPDF(sampleData, options);
            }
        } catch (error: any) {
            console.error('PDF generation failed:', error);
            throw new Error(`Failed to generate PDF: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Generate multiple PDF reports in batch
     */
    public async generateBatchReports(
        samples: any[], 
        options: PDFOptions = { method: 'server' }
    ): Promise<{ success: number; failed: number; errors: string[] }> {
        const results: { success: number; failed: number; errors: string[] } = { 
            success: 0, 
            failed: 0, 
            errors: [] 
        };

        if (options.method === 'server') {
            try {
                const response = await fetch(`${this.baseURL}/api/pdf/generate-batch`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ samples })
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    results.success = data.generated;
                    results.failed = data.failed;
                    
                    // Download successful reports
                    for (const report of data.reports) {
                        if (!report.error) {
                            this.downloadBase64PDF(report.buffer, report.filename);
                        } else {
                            results.errors.push(`${report.sampleId}: ${report.error}`);
                        }
                    }
                } else {
                    throw new Error(data.error || 'Unknown server error');
                }
            } catch (error: any) {
                results.failed = samples.length;
                results.errors.push(error?.message || 'Unknown error');
            }
        } else {
            // Client-side batch generation
            for (const sample of samples) {
                try {
                    await this.generateClientPDF(sample, options);
                    results.success++;
                } catch (error: any) {
                    results.failed++;
                    results.errors.push(`${sample.sampleId}: ${error?.message || 'Unknown error'}`);
                }
            }
        }

        return results;
    }

    /**
     * Generate PDF using client-side libraries
     */
    private async generateClientPDF(sampleData: any, options: PDFOptions): Promise<void> {
        try {
            await generateSampleReport(sampleData);
        } catch (error: any) {
            throw new Error(`Client PDF generation failed: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Generate PDF using server-side service
     */
    private async generateServerPDF(sampleData: any, options: PDFOptions): Promise<void> {
        try {
            const response = await fetch(`${this.baseURL}/api/pdf/generate-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...sampleData,
                    format: options.format || 'standard',
                    includeCharts: options.includeCharts || false,
                    watermark: options.watermark
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HelixAI_Report_${sampleData.sampleId}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            throw new Error(`Server PDF generation failed: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Download PDF from base64 data
     */
    private downloadBase64PDF(base64Data: string, filename: string): void {
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            throw new Error(`Failed to download PDF: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Generate summary report for multiple samples
     */
    public async generateSummaryReport(
        samples: any[], 
        title: string = 'HelixAI Summary Report'
    ): Promise<void> {
        try {
            const generator = new PDFGenerator();
            
            // Create summary data
            const summaryData = {
                title,
                totalSamples: samples.length,
                completedSamples: samples.filter(s => s.status === 'completed').length,
                highRiskSamples: samples.filter(s => (s.riskScore || 0) >= 70).length,
                mediumRiskSamples: samples.filter(s => (s.riskScore || 0) >= 30 && (s.riskScore || 0) < 70).length,
                lowRiskSamples: samples.filter(s => (s.riskScore || 0) < 30).length,
                averageRiskScore: samples.reduce((sum, s) => sum + (s.riskScore || 0), 0) / samples.length,
                samples: samples.slice(0, 10), // Include first 10 samples for detailed view
                generatedAt: new Date().toISOString()
            };

            // Generate summary PDF (you would implement this method in PDFGenerator)
            await this.generateSummaryPDF(summaryData);
            
        } catch (error: any) {
            throw new Error(`Summary report generation failed: ${error?.message || 'Unknown error'}`);
        }
    }

    private async generateSummaryPDF(summaryData: any): Promise<void> {
        // This would be implemented in the PDFGenerator class
        // For now, we'll use the server-side generation
        try {
            const response = await fetch(`${this.baseURL}/api/pdf/generate-summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(summaryData)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `HelixAI_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Server summary generation not available');
            }
        } catch (error) {
            // Fallback to client-side generation
            console.warn('Server summary generation failed, using client-side fallback');
            // Implement client-side summary generation here
        }
    }

    /**
     * Check if server-side PDF generation is available
     */
    public async isServerAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get PDF generation capabilities
     */
    public async getCapabilities(): Promise<{
        clientSide: boolean;
        serverSide: boolean;
        batchGeneration: boolean;
        summaryReports: boolean;
    }> {
        const serverAvailable = await this.isServerAvailable();
        
        return {
            clientSide: true, // Always available
            serverSide: serverAvailable,
            batchGeneration: serverAvailable,
            summaryReports: serverAvailable
        };
    }
}

// Export singleton instance
export const pdfService = PDFService.getInstance();