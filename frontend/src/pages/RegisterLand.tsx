import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import LocationPicker from '../components/ui/location-picker';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  CheckCircle,
  User,
  Phone,
  Home,
  Loader,
  MapPin,
  X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useLand } from '../contexts/LandContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  ownerName: string;
  ownerPhone: string;
  area: string;
  latitude: number;
  longitude: number;
  address: string;
  documents: File[];
}

const RegisterLand: React.FC = () => {
  const navigate = useNavigate();
  const { registerLand, uploadDocument, clearCache } = useLand();
  const { account } = useWeb3();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    ownerName: '',
    ownerPhone: '',
    area: '',
    latitude: 28.6139,
    longitude: 77.2090,
    address: '',
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Location & Map', icon: MapPin },
    { number: 3, title: 'Document Upload', icon: FileText },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...acceptedFiles]
      }));
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(file => {
        file.errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error('File size must be less than 5MB');
          } else if (error.code === 'file-invalid-type') {
            toast.error('Only JPG, PNG, and PDF files are allowed');
          }
        });
      });
    }
  });

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || ''
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.ownerName && formData.ownerPhone && formData.area);
      case 2:
        return !!(formData.latitude && formData.longitude);
      case 3:
        return formData.documents.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload documents to IPFS with encryption
      const documentHashes: string[] = [];
      
      toast.loading(`Uploading ${formData.documents.length} document(s) to IPFS...`);
      
      // Generate temporary property ID for encryption
      const tempPropertyId = `temp-${Date.now()}`;
      
      for (let i = 0; i < formData.documents.length; i++) {
        const file = formData.documents[i];
        toast.loading(`🔐 Encrypting and uploading ${file.name} (${i + 1}/${formData.documents.length})...`);
        
        // Upload with encryption (using owner address and temp property ID)
        const hash = await uploadDocument(file, tempPropertyId, account);
        if (hash) {
          documentHashes.push(hash);
        }
      }

      setIsUploading(false);
      toast.dismiss(); // Clear loading toasts

      if (documentHashes.length === 0) {
        toast.error('Failed to upload documents');
        return;
      }

      if (documentHashes.length < formData.documents.length) {
        toast.error(`Only ${documentHashes.length} out of ${formData.documents.length} documents uploaded successfully`);
      }

      toast.loading('Registering property on blockchain...');

      // Register land
      const landData = {
        userId: user?.id,
        userEmail: user?.email,
        userGoogleId: user?.googleId, // Add googleId for better tracking
        owner: account,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        area: parseInt(formData.area),
        latitude: formData.latitude,
        longitude: formData.longitude,
        ipfsHash: documentHashes[0], // Main document hash
        documents: documentHashes
      };

      const success = await registerLand(landData);
      
      toast.dismiss(); // Clear loading toast
      
      if (success) {
        toast.success('🎉 Land registered successfully!');
        // Clear cache to ensure fresh data fetch on dashboard
        clearCache();
        // Clear form data
        setFormData({
          ownerName: '',
          ownerPhone: '',
          area: '',
          latitude: 28.6139,
          longitude: 77.2090,
          address: '',
          documents: []
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.dismiss();
      toast.error('Failed to register land');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please login to register a new property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/login">Login Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center page-container">
          <Card className="p-8">
            <CardHeader>
              <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Please connect your wallet to register your property on the blockchain.
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
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">
          Register New Property
        </h1>
        <p className="text-muted-foreground">
          Secure your property ownership on the blockchain
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.number
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  Step {step.number}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the property owner details and basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Enter your full name"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input
                      id="ownerPhone"
                      placeholder="+91 98765 43210"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Property Area (sq ft) *</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="2000"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                    />
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Label>Wallet Address</Label>
                        <p className="text-sm font-mono bg-background p-2 rounded border">
                          {account}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
              />
            </motion.div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>
                    Upload property documents and certificates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {isDragActive ? 'Drop files here' : 'Drag & Drop Documents'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: JPG, PNG, PDF (Max 5MB each)
                    </p>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className="space-y-3">
                      <Label>Uploaded Files:</Label>
                      {formData.documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Please review your information before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Owner Name</Label>
                      <p className="font-medium">{formData.ownerName}</p>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <p className="font-medium">{formData.ownerPhone}</p>
                    </div>
                    <div>
                      <Label>Property Area</Label>
                      <p className="font-medium">{formData.area} sq ft</p>
                    </div>
                    <div>
                      <Label>Documents</Label>
                      <p className="font-medium">{formData.documents.length} files</p>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <p className="font-medium">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                    {formData.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.address}
                      </p>
                    )}
                  </div>

                  <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200">
                            Important Notice
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            By submitting this form, you confirm that all information provided is accurate 
                            and you have the legal right to register this property. The registration will 
                            create an NFT on the blockchain and upload documents to IPFS.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading Documents...' : 'Registering...'}
                </>
              ) : (
                <>
                  Submit & Mint NFT
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterLand;