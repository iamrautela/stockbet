import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

export const DepositModal = ({ open, onOpenChange, onSuccess }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 100 || numAmount > 1000000) {
      setError('Amount must be between ₹100 and ₹10,00,000');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: rpcError } = await supabase.rpc('deposit_funds', {
        p_amount: numAmount,
      });

      if (rpcError) throw rpcError;

      toast.success(`Successfully deposited ₹${numAmount.toLocaleString()}`);
      setAmount('');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to deposit funds');
      toast.error('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>Add money to your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              min={100}
              max={1000000}
            />
            <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹10,00,000</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
              >
                ₹{quickAmount.toLocaleString()}
              </Button>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleDeposit} disabled={loading || !amount} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
