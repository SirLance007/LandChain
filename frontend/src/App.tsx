import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterLand from './pages/RegisterLand';
import MyLands from './pages/MyLands';
import LandDetails from './pages/LandDetails';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { LandProvider } from './contexts/LandContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Web3Provider>
        <LandProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            {/* Navigation */}
            <Navbar />
            
            {/* Main Content */}
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<RegisterLand />} />
                <Route path="/my-lands" element={<MyLands />} />
                <Route path="/land/:tokenId" element={<LandDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                className: 'bg-background border text-foreground',
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </Router>
      </LandProvider>
    </Web3Provider>
  </AuthProvider>
  );
};

export default App;