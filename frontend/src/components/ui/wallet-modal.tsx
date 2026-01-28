import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, RefreshCw, Copy, LogOut, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { account, connectWallet, disconnectWallet, switchAccount, isConnecting, chainId } = useWeb3();

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard!');
    }
  };

  const handleSwitchAccount = async () => {
    await switchAccount();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      default: return `Chain ID: ${chainId}`;
    }
  };

  // Auto-close when connected
  React.useEffect(() => {
    if (account && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5s so user sees "Connected" success state
      return () => clearTimeout(timer);
    }
  }, [account, isOpen, onClose]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet Connection
                  </CardTitle>
                  <CardDescription>
                    {account ? 'Manage your wallet connection' : 'Connect your wallet to continue'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {account ? (
                  // Connected State
                  <div className="space-y-4">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Wallet Connected
                      </span>
                    </div>

                    {/* Account Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Account Address</label>
                        <div className="flex items-center gap-2 mt-1 p-3 bg-muted rounded-lg">
                          <Badge variant="secondary" className="font-mono text-xs flex-1">
                            {account}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={copyAddress}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {chainId && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Network</label>
                          <div className="mt-1 p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">{getNetworkName(chainId)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSwitchAccount}
                        disabled={isConnecting}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                        Switch Account
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Etherscan
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDisconnect}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Disconnect Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Not Connected State
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                      <p className="text-muted-foreground text-sm">
                        Connect your MetaMask wallet to access all features of LandChain
                      </p>
                    </div>

                    <Button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="w-full"
                      size="lg"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                    </Button>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Tip:</strong> MetaMask will ask you to select which account to connect.
                        Choose the account you want to use for property registration.
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Don't have MetaMask?{' '}
                        <a
                          href="https://metamask.io/download/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Install here
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default WalletModal;