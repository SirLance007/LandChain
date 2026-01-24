import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { useLand } from '../../contexts/LandContext';
import { testBackendConnection, testUploadEndpoint } from '../../utils/api-test';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const UploadTest: React.FC = () => {
  const { uploadDocument } = useLand();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed'>('testing');

  useEffect(() => {
    // Test backend connection on component mount
    testBackendConnection().then(result => {
      setConnectionStatus(result.success ? 'success' : 'failed');
      console.log('Connection test result:', result);
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDirectUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await testUploadEndpoint(selectedFile);
      setResult(result.ipfsHash);
      console.log('Direct upload successful:', result);
    } catch (error) {
      console.error('Direct upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContextUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const hash = await uploadDocument(selectedFile);
      setResult(hash);
    } catch (error) {
      console.error('Context upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Test
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          {connectionStatus === 'testing' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Testing connection...</span>
            </>
          )}
          {connectionStatus === 'success' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Backend connected</span>
            </>
          )}
          {connectionStatus === 'failed' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Backend connection failed</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            onChange={handleFileSelect}
          />
        </div>

        {selectedFile && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleDirectUpload} 
            disabled={!selectedFile || isUploading || connectionStatus !== 'success'}
            className="flex-1"
            variant="outline"
          >
            {isUploading ? 'Uploading...' : 'Direct Test'}
          </Button>
          
          <Button 
            onClick={handleContextUpload} 
            disabled={!selectedFile || isUploading || connectionStatus !== 'success'}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : 'Context Test'}
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">Upload Successful!</p>
            <p className="text-xs text-green-600 font-mono break-all mt-1">
              IPFS Hash: {result}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadTest;