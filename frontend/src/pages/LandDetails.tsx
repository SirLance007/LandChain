import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import PropertyMap from '../components/ui/property-map';
import { getContractAddress, getExplorerUrl, getTransactionUrl } from '../config/contracts';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  Home, 
  FileText, 
  ExternalLink,
  Share2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Eye,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLand, Land } from '../contexts/LandContext';

const LandDetails: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { getLand } = useLand();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenId) {
      fetchLandDetails();
    }
  }, [tokenId]);

  const fetchLandDetails = async () => {
    if (!tokenId) return;
    
    setLoading(true);
    const landData = await getLand(parseInt(tokenId));
    if (landData) {
      setLand(landData);
    } else {
      navigate('/my-lands');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">⏳ Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">❌ Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="glass-card text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blockchain-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="glass-card text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-gray-400 mb-6">
            The requested property could not be found.
          </p>
          <button
            onClick={() => navigate('/my-lands')}
            className="btn-primary"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 page-container">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-lands')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Properties
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Property #{land.tokenId}
            </h1>
            <p className="text-muted-foreground">
              Registered on {new Date(land.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Status Badge */}
            {getStatusBadge(land.status)}
            
            {/* Action Buttons */}
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Property Overview Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{land.ownerName}'s Property</CardTitle>
                <CardDescription>{land.area.toLocaleString()} sq ft</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Token ID</p>
              <p className="font-mono font-semibold">#{land.tokenId}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Owner Name</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{land.ownerName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-medium">{land.ownerPhone}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Property Area</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Home className="w-4 h-4 text-primary" />
                      <span className="font-medium">{land.area.toLocaleString()} sq ft</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Registration Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {new Date(land.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Wallet Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">
                        {`${land.owner.slice(0, 6)}...${land.owner.slice(-4)}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(land.owner, 'Wallet address')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">
                        {land.latitude.toFixed(6)}, {land.longitude.toFixed(6)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(`${land.latitude}, ${land.longitude}`, 'Coordinates')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Map */}
          <PropertyMap
            latitude={land.latitude}
            longitude={land.longitude}
            propertyId={land.tokenId.toString()}
          />

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Property Documents</CardTitle>
              <CardDescription>
                Documents stored on IPFS for permanent access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {land.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {land.documents.map((hash, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Document {index + 1}</h3>
                          <p className="text-sm text-muted-foreground">IPFS Hash</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-mono text-muted-foreground break-all bg-muted p-2 rounded">
                          {hash}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(hash, 'IPFS hash')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Documents</h3>
                  <p className="text-muted-foreground">
                    No documents have been uploaded for this property.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Information</CardTitle>
              <CardDescription>
                Immutable records stored on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Contract Address</Label>
                <div className="flex items-center gap-2 mt-1 p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm flex-1">
                    {getContractAddress()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(getContractAddress(), 'Contract address')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {land.transactionHash && (
                <div>
                  <Label className="text-muted-foreground">Transaction Hash</Label>
                  <div className="flex items-center gap-2 mt-1 p-3 bg-muted rounded-lg">
                    <span className="font-mono text-sm flex-1 break-all">
                      {land.transactionHash}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(land.transactionHash!, 'Transaction hash')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(getTransactionUrl(land.transactionHash!), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">IPFS Hash</Label>
                <div className="flex items-center gap-2 mt-1 p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm flex-1 break-all">
                    {land.ipfsHash}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(land.ipfsHash, 'IPFS hash')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Token Standard</Label>
                  <p className="font-medium">ERC-721 (NFT)</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Network</Label>
                  <p className="font-medium">Ethereum Mainnet</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => window.open(getExplorerUrl(), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Monad Explorer
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${land.ipfsHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  View on IPFS (Encrypted)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token ID</span>
                <span className="font-mono">#{land.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(land.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span>{land.documents.length} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span>{land.area.toLocaleString()} sq ft</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share Property
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandDetails;