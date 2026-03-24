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

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 1_000_000) {
      setError('Amount must be between ₹100 and ₹10,00,000');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Get current wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentBalance = wallet ? Number(wallet.balance) : 0;
      const newBalance = currentBalance + numAmount;

      // Upsert wallet balance directly — no RPC needed
      const { error: upsertErr } = await supabase
        .from('wallets')
        .upsert(
          { user_id: user.id, balance: newBalance, in_bets: 0 },
          { onConflict: 'user_id' }
        );

      if (upsertErr) throw upsertErr;

      // Log transaction
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount: numAmount,
        status: 'completed',
        description: 'Manual deposit',
      });

      toast.success(`₹${numAmount.toLocaleString('en-IN')} added to your wallet`);
      setAmount('');
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deposit funds';
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
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>Add dummy money to your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              min={100}
              max={1000000}
            />
            <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹10,00,000</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => setAmount(q.toString())}>
                ₹{q.toLocaleString('en-IN')}
              </Button>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleDeposit} disabled={loading || !amount} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Funds
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
