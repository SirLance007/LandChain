import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  MapPin, 
  Calendar, 
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useLand } from '../contexts/LandContext';
import { useWeb3 } from '../contexts/Web3Context';

const MyLands: React.FC = () => {
  const { lands, loading, getAllLands } = useLand();
  const { account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    getAllLands();
  }, []);

  const userLands = account 
    ? lands.filter(land => land.owner.toLowerCase() === account.toLowerCase())
    : [];

  const filteredLands = userLands
    .filter(land => {
      const matchesSearch = 
        land.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        land.tokenId.toString().includes(searchTerm) ||
        land.area.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || land.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'area-high':
          return b.area - a.area;
        case 'area-low':
          return a.area - b.area;
        case 'tokenId':
          return a.tokenId - b.tokenId;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

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

  if (!account) {
    return (
      <div className="page-container-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blockchain-blue to-blockchain-green p-5">
            <Home className="w-full h-full text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your registered properties.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-10 page-container"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-2">
            My <span className="gradient-text">Properties</span>
          </h1>
          <p className="text-gray-400">
            Manage and track your registered properties
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="glass-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, token ID, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="area-high">Area (High to Low)</option>
                  <option value="area-low">Area (Low to High)</option>
                  <option value="tokenId">Token ID</option>
                </select>
              </div>

              {/* Add New Property */}
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Register New</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredLands.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLands.map((land) => (
              <motion.div
                key={land._id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card group cursor-pointer"
              >
                {/* Property Image/Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blockchain-blue/20 to-blockchain-green/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <Home className="w-16 h-16 text-white/50" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(land.status)}`}>
                    {getStatusIcon(land.status)}
                    <span className="capitalize">{land.status}</span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold group-hover:text-blockchain-blue transition-colors">
                      Property #{land.tokenId}
                    </h3>
                    <span className="text-sm text-gray-400 font-mono">
                      #{land.tokenId}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Home size={16} />
                      <span>{land.area} sq ft</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{land.latitude.toFixed(4)}, {land.longitude.toFixed(4)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{new Date(land.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{land.ownerName}</p>
                        <p className="text-xs text-gray-400">{land.ownerPhone}</p>
                      </div>
                      
                      <Link to={`/land/${land.tokenId}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg glass-morphism hover:bg-white/20 transition-colors"
                        >
                          <Eye size={18} />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="glass-card text-center py-16"
          >
            <Home className="w-20 h-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No Properties Found' : 'No Properties Yet'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters to find properties.'
                : 'Start building your property portfolio by registering your first property on the blockchain.'
              }
            </p>
            
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus size={18} />
                  <span>Register Your First Property</span>
                </motion.button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Summary Stats */}
        {filteredLands.length > 0 && (
          <motion.div variants={itemVariants} className="mt-8">
            <div className="glass-card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold font-orbitron gradient-text">
                    {filteredLands.length}
                  </div>
                  <div className="text-sm text-gray-400">Total Properties</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold font-orbitron text-green-400">
                    {filteredLands.filter(land => land.status === 'verified').length}
                  </div>
                  <div className="text-sm text-gray-400">Verified</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold font-orbitron text-orange-400">
                    {filteredLands.filter(land => land.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold font-orbitron gradient-text">
                    {filteredLands.reduce((total, land) => total + land.area, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Area (sq ft)</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MyLands;