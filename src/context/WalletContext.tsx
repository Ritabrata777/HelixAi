import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Polygon Amoy Testnet Configuration
const AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
const AMOY_CONFIG = {
    chainId: AMOY_CHAIN_ID,
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
    },
    rpcUrls: [process.env.REACT_APP_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

interface WalletContextType {
    account: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    chainId: string | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    switchToAmoy: () => Promise<void>;
    isAmoyNetwork: boolean;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!account;
    const isAmoyNetwork = chainId === AMOY_CHAIN_ID;

    // Check if MetaMask is installed and get the correct provider
    const getEthereum = () => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            const ethereum = (window as any).ethereum;
            // Check for multiple injected providers (Coinbase + MetaMask often creates this)
            if (ethereum.providers && Array.isArray(ethereum.providers)) {
                const metamaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
                if (metamaskProvider) return metamaskProvider;
            }
            // If MetaMask is strictly requested, we might want to check ethereum.isMetaMask
            // But if it's the only one, we return it.
            return ethereum;
        }
        return null;
    };

    // Connect to MetaMask
    const connectWallet = useCallback(async () => {
        const ethereum = getEthereum();

        if (!ethereum) {
            setError('MetaMask is not installed. Please install MetaMask to continue.');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Request account access
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const currentChainId = await ethereum.request({ method: 'eth_chainId' });

            const browserProvider = new BrowserProvider(ethereum);
            const walletSigner = await browserProvider.getSigner();

            setAccount(accounts[0]);
            setChainId(currentChainId);
            setProvider(browserProvider);
            setSigner(walletSigner);

            // Store in localStorage
            localStorage.setItem('walletConnected', 'true');
        } catch (err: any) {
            console.error('Error connecting to MetaMask:', err);
            setError(err.message || 'Failed to connect to MetaMask');
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Disconnect wallet
    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setChainId(null);
        setProvider(null);
        setSigner(null);
        localStorage.removeItem('walletConnected');
    }, []);

    // Switch to Polygon Amoy network
    const switchToAmoy = useCallback(async () => {
        const ethereum = getEthereum();
        if (!ethereum) return;

        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: AMOY_CHAIN_ID }]
            });
        } catch (switchError: any) {
            // Chain not added, add it
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [AMOY_CONFIG]
                    });
                } catch (addError: any) {
                    console.error('Error adding Amoy network:', addError);
                    setError('Failed to add Polygon Amoy network');
                }
            } else {
                console.error('Error switching to Amoy:', switchError);
                setError('Failed to switch to Polygon Amoy network');
            }
        }
    }, []);

    // Listen for account and chain changes
    useEffect(() => {
        const ethereum = getEthereum();
        if (!ethereum) return;

        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                setAccount(accounts[0]);
                if (provider) {
                    const newSigner = await provider.getSigner();
                    setSigner(newSigner);
                }
            }
        };

        const handleChainChanged = (newChainId: string) => {
            setChainId(newChainId);
            // Refresh provider and signer on chain change
            if (account) {
                const browserProvider = new BrowserProvider(ethereum);
                setProvider(browserProvider);
                browserProvider.getSigner().then(setSigner);
            }
        };

        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);

        // Auto-connect if previously connected
        if (localStorage.getItem('walletConnected') === 'true') {
            connectWallet();
        }

        return () => {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [account, connectWallet, disconnectWallet, provider]);

    const value: WalletContextType = {
        account,
        isConnected,
        isConnecting,
        chainId,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        switchToAmoy,
        isAmoyNetwork,
        error
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
