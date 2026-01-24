import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home,
  Plus
} from 'lucide-react';
import { useLand } from '../contexts/LandContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import TransferDialog from '../components/ui/transfer-dialog';

const MyLands: React.FC = () => {
  const { lands, loading, getAllLands } = useLand();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transferring, setTransferring] = useState<number | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

  const handleTransferProperty = (tokenId: number) => {
    setSelectedPropertyId(tokenId);
    setTransferDialogOpen(true);
  };

  const fetchPendingTransfers = async () => {
    if (!user) return;
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/transfer/pending`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setPendingTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
    }
  };

  const handleTransferSubmit = async (buyerEmail: string, price?: number) => {
    if (!user || !selectedPropertyId) return;
    
    setTransferring(selectedPropertyId);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/transfer/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          buyerEmail,
          price
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Transfer key generated successfully!');
        // Refresh lands and pending transfers
        getAllLands(undefined, undefined, user.email);
        fetchPendingTransfers();
        return data; // Return the data to the dialog
      } else {
        toast.error(data.error || 'Failed to generate transfer key');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to initiate transfer');
      throw error;
    } finally {
      setTransferring(null);
    }
  };

  useEffect(() => {
    // Use ONLY email-based filtering for proper user isolation
    if (isAuthenticated && user && lands.length === 0) {
      getAllLands(undefined, undefined, user.email); // Remove wallet address completely
    }
    
    // Fetch pending transfers
    if (isAuthenticated && user) {
      fetchPendingTransfers();
    }
  }, [isAuthenticated, user?.email]); // Remove account dependency

  // Since we're now fetching user-specific lands from backend, no need to filter again
  const userLands = lands;

  const filteredLands = userLands
    .filter(land => {
      const matchesSearch = 
        land.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        land.tokenId.toString().includes(searchTerm) ||
        land.area.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || land.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Home className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to view and manage your registered properties.
          </p>
          <Link to="/login">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
              Login Now
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 pb-10 page-container"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beautiful Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Properties</h1>
                <p className="text-gray-600 text-lg">
                  {lands.length} {lands.length === 1 ? 'property' : 'properties'} registered on blockchain
                </p>
              </div>
              <Link to="/register">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg transition-all duration-200">
                  <Plus size={20} />
                  <span>Add New Property</span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Pending Transfers Notification */}
        {pendingTransfers.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900">
                      {pendingTransfers.length} Transfer{pendingTransfers.length > 1 ? 's' : ''} Awaiting Confirmation
                    </h3>
                    <p className="text-sm text-orange-700">
                      Buyers have accepted your property transfers. Please confirm to complete.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {pendingTransfers.slice(0, 2).map((transfer) => (
                    <Link 
                      key={transfer.transferKey}
                      to={`/transfer/${transfer.transferKey}`}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirm #{transfer.propertyId}
                    </Link>
                  ))}
                  {pendingTransfers.length > 2 && (
                    <span className="text-orange-600 text-sm font-medium px-2 py-1">
                      +{pendingTransfers.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clean Search and Filter */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search properties by name, token ID, or area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">All Properties</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Only</option>
                </select>
                <div className="text-sm text-gray-500 flex items-center px-3">
                  {filteredLands.length} of {lands.length} properties
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Beautiful Property Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredLands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLands.map((land) => (
              <div
                key={land._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Property #{land.tokenId}</h3>
                        <p className="text-blue-100 text-sm">Token ID: {land.tokenId}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      land.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : land.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {land.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Property Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Owner</span>
                      <span className="text-gray-900 font-semibold">{land.ownerName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Area</span>
                      <span className="text-gray-900 font-semibold">{land.area.toLocaleString()} sq ft</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Location</span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {land.latitude.toFixed(4)}, {land.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Registered</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(land.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Blockchain</span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {land.transactionHash && land.transactionHash !== 'simulated'
                          ? `TX: ${land.transactionHash.substring(0, 10)}...`
                          : land.status === 'verified' 
                          ? 'On-chain ✅'
                          : 'Pending ⏳'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link to={`/land/${land.tokenId}`} className="flex-1">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </button>
                    </Link>
                    
                    {land.status === 'verified' && (
                      <button
                        onClick={() => handleTransferProperty(land.tokenId)}
                        disabled={transferring === land.tokenId}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {transferring === land.tokenId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>Transfer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Property Value</span>
                    <span className="text-gray-700 font-semibold">
                      {land.status === 'verified' ? 'Market Ready' : 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Home className="w-12 h-12 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm || statusFilter !== 'all' ? 'No Properties Found' : 'Start Your Property Portfolio'}
              </h3>
              
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find properties.'
                  : 'Register your first property on the blockchain to begin building your digital property portfolio.'
                }
              </p>
              
              {!searchTerm && statusFilter === 'all' ? (
                <div className="space-y-6">
                  <Link to="/register">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200">
                      Register Your First Property
                    </button>
                  </Link>
                  
                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Blockchain Secured</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Government Verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Transferable NFTs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Beautiful Portfolio Stats */}
        {filteredLands.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{filteredLands.length}</div>
                <div className="text-sm text-blue-700 font-medium">Total Properties</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {filteredLands.filter(land => land.status === 'verified').length}
                </div>
                <div className="text-sm text-green-700 font-medium">Verified</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {filteredLands.filter(land => land.status === 'pending').length}
                </div>
                <div className="text-sm text-orange-700 font-medium">Pending</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {filteredLands.reduce((total, land) => total + land.area, 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-700 font-medium">Total Area (sq ft)</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setSelectedPropertyId(null);
        }}
        onTransfer={handleTransferSubmit}
        propertyId={selectedPropertyId || 0}
        loading={transferring !== null}
      />
    </motion.div>
  );
};

export default MyLands;