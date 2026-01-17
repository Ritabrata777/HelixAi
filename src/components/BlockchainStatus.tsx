import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const BlockchainStatus: React.FC = () => {
    const { isConnected, isAmoyNetwork, account } = useWallet();

    if (!isConnected) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '10px',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--danger)',
                zIndex: 1000
            }}>
                <WifiOff size={16} />
                <span>Wallet Disconnected</span>
            </div>
        );
    }

    if (!isAmoyNetwork) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(255, 200, 0, 0.1)',
                border: '1px solid var(--warning)',
                borderRadius: '10px',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--warning)',
                zIndex: 1000
            }}>
                <AlertTriangle size={16} />
                <span>Wrong Network</span>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 255, 150, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: '10px',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--success)',
            zIndex: 1000
        }}>
            <CheckCircle size={16} />
            <span>Blockchain Connected</span>
        </div>
    );
};

export default BlockchainStatus;