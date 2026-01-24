import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          const chainId = await window.ethereum.request({ 
            method: 'eth_chainId' 
          });
          setChainId(parseInt(chainId, 16));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          toast.success('Account changed successfully');
        } else {
          setAccount(null);
          toast('Wallet disconnected');
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        toast('Network changed');
      });

      window.ethereum.on('disconnect', () => {
        setAccount(null);
        setChainId(null);
        toast('Wallet disconnected');
      });
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        setChainId(parseInt(chainId, 16));

        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    // Clear any stored connection data
    localStorage.removeItem('walletConnected');
    // Clear MetaMask connection
    if (typeof window.ethereum !== 'undefined') {
      // Force MetaMask to forget the connection
      window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }).catch(() => {
        // Ignore errors, just disconnect
      });
    }
    toast.success('Wallet disconnected successfully');
  };

  const switchAccount = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);

    try {
      // Force MetaMask to show account selection
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      // Request accounts again to get the selected account
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success(`Switched to: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (error: any) {
      console.error('Error switching account:', error);
      
      if (error.code === 4001) {
        toast.error('Account switch cancelled by user');
      } else {
        toast.error('Failed to switch account');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('Error switching network:', error);
      
      if (error.code === 4902) {
        toast.error('Network not added to MetaMask');
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  const value: Web3ContextType = {
    account,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    switchAccount,
    switchNetwork,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};