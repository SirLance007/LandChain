import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Chrome, Shield, Zap, Users } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for auth success/error in URL params
    const authStatus = searchParams.get('auth');
    const error = searchParams.get('error');

    if (authStatus === 'success') {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to LandChain</CardTitle>
            <CardDescription className="text-base">
              Secure blockchain-based property registration system
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
              variant="outline"
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            {/* Features */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-center text-muted-foreground">
                Why choose LandChain?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Blockchain Security</p>
                    <p className="text-xs text-muted-foreground">Immutable property records</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fast Verification</p>
                    <p className="text-xs text-muted-foreground">Quick government approval</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">User Friendly</p>
                    <p className="text-xs text-muted-foreground">Simple registration process</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-foreground">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;