import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';

interface BlockchainTxLinkProps {
    txHash?: string;
    label?: string;
    showIcon?: boolean;
    compact?: boolean;
}

const BlockchainTxLink: React.FC<BlockchainTxLinkProps> = ({ 
    txHash, 
    label = "Blockchain Tx", 
    showIcon = true,
    compact = false 
}) => {
    if (!txHash) {
        return (
            <span style={{ 
                color: 'var(--text-muted)', 
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: compact ? '0.75rem' : '0.85rem'
            }}>
                <Clock size={12} />
                Blockchain verification pending...
            </span>
        );
    }

    const displayHash = compact 
        ? `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}`
        : txHash;

    return (
        <div style={{ fontSize: compact ? '0.75rem' : '0.85rem' }}>
            {label && <span style={{ color: 'var(--text-secondary)' }}>{label}: </span>}
            <a 
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                    color: 'var(--accent-cyan)', 
                    textDecoration: 'none',
                    fontFamily: 'Space Mono, monospace',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                title={`View on PolygonScan: ${txHash}`}
            >
                {displayHash}
                {showIcon && <ExternalLink size={12} />}
            </a>
        </div>
    );
};

export default BlockchainTxLink;