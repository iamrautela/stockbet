import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onSuccess: () => void;
}

export const WithdrawModal = ({ open, onOpenChange, currentBalance, onSuccess }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 100) {
      setError('Amount must be at least ₹100');
      return;
    }

    if (numAmount > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (backendApiEnabled()) {
        await apiFetch('/api/wallet', {
          method: 'POST',
          json: { action: 'withdraw', amount: numAmount },
        });
      } else {
        const { error: rpcError } = await supabase.rpc('withdraw_funds', {
          p_amount: numAmount,
        });
        if (rpcError) throw rpcError;
      }

      toast.success('Withdrawal request submitted');
      setAmount('');
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw funds');
      toast.error('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>Request a withdrawal from your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">₹{currentBalance.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawAmount">Amount (₹)</Label>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              min={100}
              max={currentBalance}
            />
            <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹{currentBalance.toLocaleString()}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleWithdraw} disabled={loading || !amount} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Withdraw
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
