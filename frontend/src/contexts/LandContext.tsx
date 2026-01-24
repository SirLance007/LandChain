import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface Land {
  _id: string;
  tokenId: number;
  owner: string;
  ownerName: string;
  ownerPhone: string;
  ipfsHash: string;
  latitude: number;
  longitude: number;
  area: number;
  documents: string[];
  status: 'pending' | 'verified' | 'rejected';
  transactionHash?: string;
  createdAt: string;
}

interface LandContextType {
  lands: Land[];
  loading: boolean;
  registerLand: (landData: Partial<Land>) => Promise<boolean>;
  getLand: (tokenId: number) => Promise<Land | null>;
  getAllLands: () => Promise<void>;
  uploadDocument: (file: File, propertyId?: string, ownerAddress?: string) => Promise<string | null>;
  refreshLands: () => Promise<void>;
}

const LandContext = createContext<LandContextType | undefined>(undefined);

interface LandProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const LandProvider: React.FC<LandProviderProps> = ({ children }) => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllLands();
  }, []);

  const registerLand = async (landData: Partial<Land>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/land/register`, landData);
      
      if (response.data.success) {
        toast.success('Land registered successfully!');
        await getAllLands(); // Refresh the list
        return true;
      } else {
        toast.error(response.data.error || 'Failed to register land');
        return false;
      }
    } catch (error: any) {
      console.error('Error registering land:', error);
      toast.error(error.response?.data?.error || 'Failed to register land');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getLand = async (tokenId: number): Promise<Land | null> => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/land/${tokenId}`);
      
      if (response.data.success) {
        return response.data.land;
      } else {
        toast.error('Land not found');
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching land:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch land details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAllLands = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/land`);
      
      if (response.data.success) {
        setLands(response.data.lands);
      } else {
        toast.error('Failed to fetch lands');
      }
    } catch (error: any) {
      console.error('Error fetching lands:', error);
      toast.error('Failed to fetch lands');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, propertyId?: string, ownerAddress?: string): Promise<string | null> => {
    try {
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        propertyId: propertyId,
        ownerAddress: ownerAddress,
        encrypted: !!(propertyId && ownerAddress)
      });

      const formData = new FormData();
      formData.append('file', file);
      
      // Add encryption parameters if provided
      if (propertyId && ownerAddress) {
        formData.append('propertyId', propertyId);
        formData.append('ownerAddress', ownerAddress);
      }

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        const encryptionStatus = response.data.encryption?.isEncrypted ? '🔐 Encrypted' : '📄 Unencrypted';
        toast.success(`✅ "${file.name}" uploaded successfully! ${encryptionStatus}`);
        return response.data.ipfsHash;
      } else {
        console.error('Upload failed:', response.data);
        toast.error(response.data.error || 'Failed to upload document');
        return null;
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('⏰ Upload timeout. Please try again with a smaller file.');
      } else if (error.response?.status === 413) {
        toast.error('📁 File too large. Maximum size is 5MB.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.error || '❌ Invalid file format.');
      } else if (error.response?.status === 503) {
        toast.error('🌐 IPFS service temporarily unavailable. Please try again.');
      } else if (error.response?.data?.error) {
        toast.error(`❌ ${error.response.data.error}`);
      } else if (error.message.includes('Network Error')) {
        toast.error('🌐 Network error. Please check if the server is running on port 5001.');
      } else {
        toast.error(`❌ Upload failed: ${error.message || 'Unknown error'}`);
      }
      return null;
    }
  };

  const refreshLands = async (): Promise<void> => {
    await getAllLands();
  };

  const value: LandContextType = {
    lands,
    loading,
    registerLand,
    getLand,
    getAllLands,
    uploadDocument,
    refreshLands,
  };

  return (
    <LandContext.Provider value={value}>
      {children}
    </LandContext.Provider>
  );
};

export const useLand = (): LandContextType => {
  const context = useContext(LandContext);
  if (context === undefined) {
    throw new Error('useLand must be used within a LandProvider');
  }
  return context;
};