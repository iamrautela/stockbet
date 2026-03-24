import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/backend-fetch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

// Load Razorpay script once
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const DepositModal = ({ open, onOpenChange, onSuccess }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) loadRazorpayScript();
  }, [open]);

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 1_000_000) {
      setError('Amount must be between ₹100 and ₹10,00,000');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway. Check your connection.');

      // Create Razorpay order on server
      const order = await apiFetch<{ orderId: string; amount: number; currency: string; keyId: string }>(
        '/api/payment/create-order',
        { method: 'POST', json: { amount: numAmount } }
      );

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'StockBet',
        description: 'Wallet Deposit',
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment and credit wallet on server
            await apiFetch('/api/payment/verify', {
              method: 'POST',
              json: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: order.amount,
              },
            });
            toast.success(`₹${numAmount.toLocaleString()} added to your wallet`);
            setAmount('');
            onSuccess();
            onOpenChange(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Payment verification failed');
          }
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      toast.error('Deposit failed');
      setLoading(false);
    }
    // Note: setLoading(false) is handled by modal dismiss or handler completion
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>Add real money to your wallet via Razorpay</DialogDescription>
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
            {QUICK_AMOUNTS.map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => setAmount(q.toString())}>
                ₹{q.toLocaleString()}
              </Button>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleDeposit} disabled={loading || !amount} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Pay with Razorpay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
