import React, { useState, useRef } from 'react';
import { Upload, Send, Loader2, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useToast } from '../../context/ToastContext';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatWithPDF: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showError, showSuccess } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setMessages([]); // Reset chat
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setPdfDataUri(e.target?.result as string);
                showSuccess(`File "${file.name}" loaded successfully.`);
            };
            reader.onerror = () => {
                showError('Failed to read the file.');
            };
            reader.readAsDataURL(file);

        } else {
            showError('Please upload a valid PDF file.');
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || !pdfDataUri) return;

        const newMessages: Message[] = [...messages, { text: userInput, sender: 'user' }];
        setMessages(newMessages);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const apiResponse = await fetch('/api/pdf-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentDataUri: pdfDataUri,
                    question: currentInput,
                }),
            });

            const result = await apiResponse.json();

            if (!apiResponse.ok) {
                throw new Error(result.error || 'An unknown API error occurred.');
            }
            
            setMessages([...newMessages, { text: result.answer, sender: 'bot' }]);
        } catch (error: any) {
            const errorMessage = error.message || "I'm having trouble connecting. Please check the server and try again.";
            console.error('Error getting answer from AI:', error);
            showError(errorMessage);
            setMessages([...newMessages, { text: errorMessage, sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="portal-page">
            <Navbar portal="user" />
            <div className="portal-container" style={{ maxWidth: '800px' }}>
                <div className="welcome-card">
                    <h2>📄 AI Document Assistant</h2>
                    <p>Upload a PDF and ask questions about its content. The AI will answer based on the information within the document.</p>
                </div>

                <div className="form-card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
                    {!pdfFile ? (
                        <div 
                            className="upload-area" 
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <Upload size={48} className="text-gray-400 mb-4" style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Upload your PDF</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Click here to select a file</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="application/pdf"
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div 
                                style={{ 
                                    padding: '12px', 
                                    background: 'rgba(0,0,0,0.2)', 
                                    borderRadius: '8px', 
                                    marginBottom: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileText size={20} style={{color: 'var(--accent-cyan)'}}/>
                                    <span style={{ color: 'var(--text-primary)' }}>{pdfFile.name}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setPdfFile(null);
                                        setPdfDataUri(null);
                                        setMessages([]);
                                        if(fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    Change File
                                </button>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', padding: '10px' }}>
                                <div className="chat-messages">
                                    {messages.length === 0 && (
                                        <div className="message bot-message" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                                            <p>PDF loaded. I'm ready to answer your questions about this document.</p>
                                        </div>
                                    )}
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`message ${msg.sender}-message`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    ))}
                                    {isLoading && (
                                         <div className="message bot-message">
                                            <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }}/>
                                         </div>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask a question about the document..."
                                    className="form-input"
                                    style={{ flex: 1 }}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="btn btn-primary"
                                    disabled={isLoading || !userInput.trim()}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWithPDF;
