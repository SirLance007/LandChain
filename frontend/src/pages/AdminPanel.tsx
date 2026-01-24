
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  MapPin,
  Building,
  Phone,
  Calendar
} from 'lucide-react';
import { useLand } from '../contexts/LandContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AdminPanel: React.FC = () => {
  const { lands, getAllLands } = useLand();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllLands().then(() => { // Fetch ALL lands for admin panel (no user filter)
      console.log('Admin Panel: Loaded lands:', lands.map(land => ({ 
        id: land._id, 
        tokenId: land.tokenId, 
        tokenIdType: typeof land.tokenId,
        status: land.status 
      })));
    });
  }, []);

  const updatePropertyStatus = async (tokenId: number, status: 'verified' | 'rejected') => {
    console.log('Frontend: Updating property status', { tokenId, status, tokenIdType: typeof tokenId });
    
    if (!tokenId || tokenId === undefined) {
      toast.error('Invalid property ID');
      return;
    }
    
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      
      const response = await axios.put(`${API_BASE_URL}/land/${tokenId}/status`, {
        status: status
      });

      if (response.data.success) {
        toast.success(`Property #${tokenId} ${status} successfully!`);
        await getAllLands(); // Refresh all lands for admin panel
      } else {
        toast.error('Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
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

  const pendingLands = lands.filter(land => land.status === 'pending');
  const verifiedLands = lands.filter(land => land.status === 'verified');
  const rejectedLands = lands.filter(land => land.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8 page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage and verify property registrations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lands.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingLands.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{verifiedLands.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{rejectedLands.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Properties */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Properties ({pendingLands.length})</CardTitle>
          <CardDescription>
            Properties awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLands.length > 0 ? (
            <div className="space-y-4">
              {pendingLands.map((land) => (
                <div
                  key={land._id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold">Property #{land.tokenId}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{land.ownerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{land.ownerPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>{land.area} sq ft</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(land.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{land.latitude.toFixed(4)}, {land.longitude.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(land.status)}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/land/${land.tokenId}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => updatePropertyStatus(land.tokenId, 'verified')}
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => updatePropertyStatus(land.tokenId, 'rejected')}
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Properties</h3>
              <p className="text-muted-foreground">
                All properties have been reviewed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Properties */}
      <Card>
        <CardHeader>
          <CardTitle>All Properties ({lands.length})</CardTitle>
          <CardDescription>
            Complete list of all registered properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lands.length > 0 ? (
            <div className="space-y-4">
              {lands.map((land) => (
                <div
                  key={land._id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Property #{land.tokenId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {land.ownerName} • {land.area} sq ft • {new Date(land.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(land.status)}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/land/${land.tokenId}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Properties</h3>
              <p className="text-muted-foreground">
                No properties have been registered yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;