import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Shield, LogOut } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const Profile: React.FC = () => {
  const { account, disconnectWallet } = useWeb3();

  if (!account) {
    return (
      <div className="page-container-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blockchain-blue to-blockchain-green p-5">
            <User className="w-full h-full text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access your profile.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 page-container">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-2">
            User <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-gray-400">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card"
            >
              <h2 className="text-xl font-semibold mb-6">Account Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blockchain-blue to-blockchain-green p-4">
                    <User className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Wallet User</h3>
                    <p className="text-gray-400 font-mono text-sm">
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Full Wallet Address
                    </label>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="font-mono text-sm break-all">{account}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Account Type
                    </label>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm">MetaMask Wallet</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card"
            >
              <h2 className="text-xl font-semibold mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="text-blockchain-blue" size={20} />
                    <div>
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-gray-400">
                        Get notified about property updates
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blockchain-blue"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="text-blockchain-blue" size={20} />
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400">
                        Add extra security to your account
                      </p>
                    </div>
                  </div>
                  <button className="btn-secondary text-sm py-2 px-4">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="text-blockchain-blue" size={20} />
                    <div>
                      <h3 className="font-medium">Privacy Settings</h3>
                      <p className="text-sm text-gray-400">
                        Control your data and privacy
                      </p>
                    </div>
                  </div>
                  <button className="btn-secondary text-sm py-2 px-4">
                    Manage
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card"
            >
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Settings size={18} />
                  <span>Account Settings</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Bell size={18} />
                  <span>Notification Center</span>
                </button>
                
                <button 
                  onClick={disconnectWallet}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <LogOut size={18} />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </motion.div>

            {/* Account Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
            >
              <h3 className="font-semibold mb-4">Account Stats</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold font-orbitron gradient-text">
                    0
                  </div>
                  <div className="text-sm text-gray-400">Properties Owned</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold font-orbitron text-green-400">
                    0
                  </div>
                  <div className="text-sm text-gray-400">Verified Properties</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold font-orbitron text-blockchain-blue">
                    0
                  </div>
                  <div className="text-sm text-gray-400">Total Transactions</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;