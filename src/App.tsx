import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import BlockchainStatus from './components/BlockchainStatus';
import LandingPage from './pages/LandingPage';
import UserPortal from './pages/user/UserPortal';
import UserDashboard from './pages/user/UserDashboard';
import TrackSample from './pages/user/TrackSample';
import UserResults from './pages/user/UserResults';
import LabPortal from './pages/lab/LabPortal';
import LabDashboard from './pages/lab/LabDashboard';
import ScanSample from './pages/lab/ScanSample';
import AnalyzeSample from './pages/lab/AnalyzeSample';
import LabHistory from './pages/lab/LabHistory';

const App: React.FC = () => {
    return (
        <ToastProvider>
            <WalletProvider>
                <BlockchainProvider>
                    <Router>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/user" element={<UserPortal />} />
                        <Route path="/user/dashboard" element={<UserDashboard />} />
                        <Route path="/user/track" element={<TrackSample />} />
                        <Route path="/user/results" element={<UserResults />} />
                        <Route path="/lab" element={<LabPortal />} />
                        <Route path="/lab/dashboard" element={<LabDashboard />} />
                        <Route path="/lab/scan" element={<ScanSample />} />
                        <Route path="/lab/analyze" element={<AnalyzeSample />} />
                        <Route path="/lab/history" element={<LabHistory />} />
                    </Routes>
                    <BlockchainStatus />
                </Router>
            </BlockchainProvider>
        </WalletProvider>
    </ToastProvider>
    );
};

export default App;
