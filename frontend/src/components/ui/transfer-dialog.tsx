import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { X, Send, Copy, Check } from 'lucide-react';

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (buyerEmail: string, price?: number) => Promise<any>;
  propertyId: number;
  loading: boolean;
}

interface TransferResult {
  transferKey: string;
  transferUrl: string;
  expiresAt: string;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  isOpen,
  onClose,
  onTransfer,
  propertyId,
  loading
}) => {
  const [buyerEmail, setBuyerEmail] = useState('');
  const [price, setPrice] = useState('');
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail.trim()) return;

    try {
      const result = await onTransfer(buyerEmail, price ? parseInt(price) : undefined);
      if (result && result.transferKey) {
        setTransferResult({
          transferKey: result.transferKey,
          transferUrl: result.transferUrl,
          expiresAt: result.expiresAt
        });
      }
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleClose = () => {
    setBuyerEmail('');
    setPrice('');
    setTransferResult(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Transfer Property</span>
                  </CardTitle>
                  <CardDescription>
                    Property #{propertyId}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {!transferResult ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="buyerEmail">Buyer's Email Address *</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="buyer@example.com"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Transfer Price (Optional)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter amount in ₹"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !buyerEmail.trim()}
                      className="flex-1"
                    >
                      {loading ? 'Generating...' : 'Generate Transfer Key'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-700">
                      Transfer Key Generated!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share this key with the buyer
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Transfer Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={transferResult.transferKey}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleCopy(transferResult.transferKey)}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Transfer URL</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={transferResult.transferUrl}
                          readOnly
                          className="text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleCopy(transferResult.transferUrl)}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Expires: {new Date(transferResult.expiresAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransferDialog;