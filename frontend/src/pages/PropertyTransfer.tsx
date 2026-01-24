import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Home, 
  User, 
  MapPin, 
  Key,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface TransferDetails {
  transfer: {
    key: string;
    status: string;
    price?: number;
    expiresAt: string;
  };
  buyerEmail: string;
  property: {
    tokenId: number;
    ownerName: string;
    area: number;
    latitude: number;
    longitude: number;
    documents: string[];
    transactionHash?: string;
    blockNumber?: number;
  };
  seller: {
    name: string;
    email: string;
  };
}

const PropertyTransfer: React.FC = () => {
  const { transferKey } = useParams<{ transferKey: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (transferKey) {
      fetchTransferDetails();
    }
  }, [transferKey]);

  const fetchTransferDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transfer/${transferKey}`);
      
      if (response.data.success) {
        setTransferDetails(response.data);
      } else {
        toast.error(response.data.error);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching transfer details:', error);
      toast.error('Invalid or expired transfer key');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!user || !transferDetails) return;
    
    setAccepting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/transfer/confirm`, {
        transferKey,
        sellerSignature: `seller_signature_${Date.now()}` // TODO: Implement proper digital signature
      });
      
      if (response.data.success) {
        toast.success('🎉 Transfer completed! Property ownership has been transferred.');
        fetchTransferDetails(); // Refresh details
        
        // Redirect to My Lands after 3 seconds
        setTimeout(() => {
          navigate('/my-lands');
        }, 3000);
      } else {
        toast.error(response.data.error);
      }
    } catch (error: any) {
      console.error('Error confirming transfer:', error);
      toast.error('Failed to confirm transfer');
    } finally {
      setAccepting(false);
    }
  };

  const handleAcceptTransfer = async () => {
    if (!user || !transferDetails) return;
    
    setAccepting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/transfer/accept`, {
        transferKey,
        buyerSignature: `buyer_signature_${Date.now()}`, // TODO: Implement proper digital signature
        buyerWalletAddress: '0x...' // TODO: Get from Web3Context
      });
      
      if (response.data.success) {
        toast.success('Transfer accepted successfully!');
        fetchTransferDetails(); // Refresh details
      } else {
        toast.error(response.data.error);
      }
    } catch (error: any) {
      console.error('Error accepting transfer:', error);
      toast.error('Failed to accept transfer');
    } finally {
      setAccepting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to view property transfer details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/login">Login Now</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (!transferDetails) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Transfer Not Found</CardTitle>
            <CardDescription>
              The transfer key is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { transfer, property, seller } = transferDetails;
  const isExpired = new Date(transfer.expiresAt) < new Date();
  
  // Check if current user is the intended buyer
  const isBuyer = user?.email === transferDetails.buyerEmail;
  const isSeller = user?.email === seller.email;
  
  // Check if user is authorized to view this transfer
  const isAuthorized = isBuyer || isSeller;

  // If user is not authorized, show error
  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This transfer is intended for a specific buyer. Please login with the correct email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Transfer intended for:</p>
                <p className="font-medium">{transferDetails.buyerEmail}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">You are logged in as:</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <Button asChild className="w-full">
                <a href="/login">Login with Different Account</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Property Transfer</h1>
          <p className="text-muted-foreground">
            {isBuyer 
              ? `You have been invited to receive this property from ${seller.name}` 
              : isSeller 
              ? 'Your property transfer request' 
              : 'Property transfer details'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Property Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Property #{property.tokenId}</h3>
                <p className="text-muted-foreground">{property.area} sq ft</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Current Owner: {property.ownerName}</span>
              </div>
              
              {transfer.price && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Transfer Price</p>
                  <p className="text-2xl font-bold text-green-700">₹{transfer.price.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Transfer Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={transfer.status === 'pending' ? 'secondary' : 'default'}>
                  {transfer.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Expires</span>
                <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {new Date(transfer.expiresAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Seller</p>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{seller.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{seller.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Intended Buyer</p>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{transferDetails.buyerEmail}</span>
                </div>
                {isBuyer && (
                  <p className="text-xs text-green-600">✓ This is you</p>
                )}
              </div>
              
              {isBuyer && transfer.status === 'pending' && !isExpired && (
                <Button 
                  onClick={handleAcceptTransfer}
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? 'Accepting...' : 'Accept Transfer'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {isSeller && transfer.status === 'buyer_accepted' && !isExpired && (
                <Button 
                  onClick={handleConfirmTransfer}
                  disabled={accepting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {accepting ? 'Confirming...' : 'Confirm Transfer'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {transfer.status === 'buyer_accepted' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-700 font-medium">
                      {isBuyer ? 'You have accepted this transfer' : 'Buyer has accepted this transfer'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {isBuyer 
                      ? 'Waiting for seller confirmation' 
                      : 'Please confirm to complete the transfer'
                    }
                  </p>
                </div>
              )}

              {transfer.status === 'both_signed' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">
                      Both parties have signed
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Transfer is being processed on blockchain
                  </p>
                </div>
              )}

              {transfer.status === 'completed' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">
                      🎉 Transfer Completed Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {isBuyer 
                      ? 'Congratulations! You are now the owner of this property.' 
                      : 'Property has been successfully transferred to the buyer.'
                    }
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-500">
                      ✅ Database ownership updated
                    </p>
                    <p className="text-xs text-green-500">
                      ⛓️ Blockchain transaction recorded
                    </p>
                    {property.transactionHash && property.transactionHash !== 'simulated' && (
                      <p className="text-xs text-green-500">
                        🔗 TX: {property.transactionHash.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {isExpired && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">Transfer Expired</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyTransfer;