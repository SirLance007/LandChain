import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import UploadTest from '../components/ui/upload-test';
import { 
  Home, 
  MapPin, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Building,
  Wallet
} from 'lucide-react';
import { useLand } from '../contexts/LandContext';
import { useWeb3 } from '../contexts/Web3Context';

const Dashboard: React.FC = () => {
  const { lands, getAllLands } = useLand();
  const { account } = useWeb3();
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    getAllLands();
  }, []);

  useEffect(() => {
    if (lands.length > 0) {
      const userLands = account ? lands.filter(land => 
        land.owner.toLowerCase() === account.toLowerCase()
      ) : lands;

      setStats({
        total: userLands.length,
        verified: userLands.filter(land => land.status === 'verified').length,
        pending: userLands.filter(land => land.status === 'pending').length,
        rejected: userLands.filter(land => land.status === 'rejected').length,
      });
    }
  }, [lands, account]);

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.total,
      icon: Home,
      description: 'Properties registered'
    },
    {
      title: 'Verified',
      value: stats.verified,
      icon: CheckCircle,
      description: 'Successfully verified'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting verification'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: AlertCircle,
      description: 'Need attention'
    }
  ];

  const recentLands = account 
    ? lands.filter(land => land.owner.toLowerCase() === account.toLowerCase()).slice(0, 5)
    : lands.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center page-container">
          <Card className="p-8">
            <CardHeader>
              <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6">
                Please connect your wallet to access your dashboard and manage your properties.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to your Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your properties and track their verification status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Properties */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>
                  Your latest property registrations
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/my-lands">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentLands.length > 0 ? (
                <div className="space-y-4">
                  {recentLands.map((land) => (
                    <div
                      key={land._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Property #{land.tokenId}</h3>
                          <p className="text-sm text-muted-foreground">
                            {land.area} sq ft • {land.ownerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(land.status)}
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/land/${land.tokenId}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by registering your first property on the blockchain
                  </p>
                  <Button asChild>
                    <Link to="/register" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Register Property
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Upload Test */}
          <UploadTest />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/register" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Register New Property
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/my-lands" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  View All Properties
                </Link>
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLands.slice(0, 3).length > 0 ? (
                <div className="space-y-4">
                  {recentLands.slice(0, 3).map((land) => (
                    <div key={land._id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          Property #{land.tokenId} was {land.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(land.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;