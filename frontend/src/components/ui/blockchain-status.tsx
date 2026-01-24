import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface BlockchainStatusProps {
  transactionHash?: string;
  blockNumber?: number;
  status: 'pending' | 'verified' | 'rejected';
  className?: string;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({
  transactionHash,
  blockNumber,
  status,
  className = ''
}) => {
  const getExplorerUrl = (txHash: string) => {
    // Monad Testnet Explorer URL
    return `https://testnet-explorer.monad.xyz/tx/${txHash}`;
  };

  const getStatusInfo = () => {
    if (transactionHash && transactionHash !== 'simulated') {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'On Blockchain',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (status === 'verified') {
      return {
        icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
        text: 'Verified',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else if (status === 'pending') {
      return {
        icon: <Clock className="w-4 h-4 text-orange-500" />,
        text: 'Pending',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    } else {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Rejected',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${className}`}>
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        {statusInfo.icon}
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        
        {transactionHash && transactionHash !== 'simulated' && (
          <a
            href={getExplorerUrl(transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            title="View on Blockchain Explorer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View TX</span>
          </a>
        )}
      </div>
      
      {transactionHash && transactionHash !== 'simulated' && (
        <div className="mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>TX:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {transactionHash.substring(0, 20)}...
            </code>
          </div>
          {blockNumber && (
            <div className="flex items-center space-x-2 mt-1">
              <span>Block:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                #{blockNumber}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockchainStatus;