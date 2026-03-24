import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const newBalance = currentBalance - numAmount;

      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -numAmount,
        status: 'completed',
        description: 'Manual withdrawal',
      });

      toast.success(`₹${numAmount.toLocaleString('en-IN')} withdrawn`);
      setAmount('');
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to withdraw funds';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>Remove dummy money from your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">₹{currentBalance.toLocaleString('en-IN')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawAmount">Amount (₹)</Label>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              min={100}
              max={currentBalance}
            />
            <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹{currentBalance.toLocaleString('en-IN')}</p>
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
