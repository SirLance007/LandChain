import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletConnectProps {
  onWalletConnect: (address: string) => void;
  currentAddress?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect, currentAddress }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Check if connected to Monad Testnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== '0x2797') { // 10143 in hex
        // Add Monad Testnet to MetaMask
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2797',
              chainName: 'Monad Testnet',
              nativeCurrency: {
                name: 'MON',
                symbol: 'MON',
                decimals: 18
              },
              rpcUrls: ['https://testnet-rpc.monad.xyz'],
              blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
            }]
          });
        } catch (addError) {
          console.error('Failed to add Monad Testnet:', addError);
        }
      }

      onWalletConnect(address);
      
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onWalletConnect('');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (currentAddress) {
    return (
      <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
          <p className="text-xs text-green-600 font-mono">{formatAddress(currentAddress)}</p>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-xs text-green-600 hover:text-green-800 underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        <Wallet className="w-5 h-5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}</span>
      </button>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Make sure MetaMask is installed</p>
        <p>• Switch to Monad Testnet</p>
        <p>• Get testnet tokens from faucet</p>
      </div>
    </div>
  );
};

// Add to window type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default WalletConnect;