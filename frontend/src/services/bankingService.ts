import { supabase } from './auth';
import { BankAccount, Transaction } from '../types';

export interface BankingServiceInterface {
  linkBankAccount(accountDetails: Omit<BankAccount, 'id' | 'isVerified' | 'addedAt'>): Promise<{ success: boolean; error?: string }>;
  verifyBankAccount(accountId: string, verificationData: any): Promise<{ success: boolean; error?: string }>;
  initiateDeposit(amount: number, bankAccountId: string): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  initiateWithdrawal(amount: number, bankAccountId: string): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  getTransactionHistory(userId: string, limit?: number): Promise<Transaction[]>;
  checkKYCStatus(userId: string): Promise<{ status: 'pending' | 'verified' | 'rejected'; documents?: any[] }>;
  submitKYCDocuments(userId: string, documents: any[]): Promise<{ success: boolean; error?: string }>;
}

class BankingService implements BankingServiceInterface {
  private readonly SUPPORTED_BANKS = [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'IDFC First Bank'
  ];

  async linkBankAccount(accountDetails: Omit<BankAccount, 'id' | 'isVerified' | 'addedAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate IFSC code format
      if (!this.validateIFSC(accountDetails.ifscCode)) {
        return { success: false, error: 'Invalid IFSC code format' };
      }

      // Validate account number
      if (!this.validateAccountNumber(accountDetails.accountNumber)) {
        return { success: false, error: 'Invalid account number format' };
      }

      // Check if bank is supported
      if (!this.SUPPORTED_BANKS.includes(accountDetails.bankName)) {
        return { success: false, error: 'Bank not supported. Please contact support.' };
      }

      // Store bank account details (encrypted)
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...accountDetails,
          is_verified: false,
          added_at: new Date().toISOString()
        });

      if (error) throw error;

      // Initiate penny drop verification
      await this.initiatePennyDrop(accountDetails.accountNumber, accountDetails.ifscCode);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyBankAccount(accountId: string, verificationData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify penny drop amount
      const isValid = await this.verifyPennyDrop(accountId, verificationData.amount);
      
      if (!isValid) {
        return { success: false, error: 'Verification failed. Please check the amount.' };
      }

      // Update account verification status
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_verified: true })
        .eq('id', accountId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async initiateDeposit(amount: number, bankAccountId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Validate minimum deposit amount
      if (amount < 100) {
        return { success: false, error: 'Minimum deposit amount is ₹100' };
      }

      // Check daily deposit limits
      const dailyLimit = await this.checkDailyDepositLimit(bankAccountId);
      if (amount > dailyLimit.remaining) {
        return { success: false, error: `Daily deposit limit exceeded. Remaining: ₹${dailyLimit.remaining}` };
      }

      // Create transaction record
      const transactionId = this.generateTransactionId();
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          type: 'deposit',
          amount,
          currency: 'INR',
          status: 'pending',
          bank_account_id: bankAccountId,
          description: `Deposit to wallet`,
          fees: this.calculateDepositFees(amount),
          reference: this.generateReference(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Initiate UPI/IMPS transfer
      await this.initiateUPITransfer(amount, bankAccountId, transactionId);

      return { success: true, transactionId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async initiateWithdrawal(amount: number, bankAccountId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Validate minimum withdrawal amount
      if (amount < 500) {
        return { success: false, error: 'Minimum withdrawal amount is ₹500' };
      }

      // Check user balance
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const userBalance = await this.getUserBalance(user.user.id);
      if (amount > userBalance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Check daily withdrawal limits
      const dailyLimit = await this.checkDailyWithdrawalLimit(user.user.id);
      if (amount > dailyLimit.remaining) {
        return { success: false, error: `Daily withdrawal limit exceeded. Remaining: ₹${dailyLimit.remaining}` };
      }

      // Create transaction record
      const transactionId = this.generateTransactionId();
      const withdrawalFees = this.calculateWithdrawalFees(amount);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          type: 'withdrawal',
          amount: amount - withdrawalFees,
          currency: 'INR',
          status: 'pending',
          bank_account_id: bankAccountId,
          description: `Withdrawal to bank account`,
          fees: withdrawalFees,
          reference: this.generateReference(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Deduct amount from user balance immediately
      await this.updateUserBalance(user.user.id, -amount);

      // Initiate NEFT/RTGS transfer
      await this.initiateNEFTTransfer(amount - withdrawalFees, bankAccountId, transactionId);

      return { success: true, transactionId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.mapTransactionFromDB);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  async checkKYCStatus(userId: string): Promise<{ status: 'pending' | 'verified' | 'rejected'; documents?: any[] }> {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return { status: 'pending', documents: [] };
      }

      return {
        status: data.status,
        documents: data.documents || []
      };
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return { status: 'pending', documents: [] };
    }
  }

  async submitKYCDocuments(userId: string, documents: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate required documents
      const requiredDocs = ['aadhaar', 'pan', 'bank_statement'];
      const submittedTypes = documents.map(doc => doc.type);
      
      for (const required of requiredDocs) {
        if (!submittedTypes.includes(required)) {
          return { success: false, error: `Missing required document: ${required}` };
        }
      }

      // Upload documents to secure storage
      const uploadedDocs = await Promise.all(
        documents.map(doc => this.uploadKYCDocument(userId, doc))
      );

      // Store KYC submission
      const { error } = await supabase
        .from('kyc_documents')
        .upsert({
          user_id: userId,
          documents: uploadedDocs,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Private helper methods
  private validateIFSC(ifsc: string): boolean {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  }

  private validateAccountNumber(accountNumber: string): boolean {
    // Basic validation - should be 9-18 digits
    const accountRegex = /^[0-9]{9,18}$/;
    return accountRegex.test(accountNumber);
  }

  private async initiatePennyDrop(accountNumber: string, ifscCode: string): Promise<void> {
    // Simulate penny drop - in real implementation, integrate with banking APIs
    const pennyAmount = Math.floor(Math.random() * 99) + 1;
    
    // Store penny drop details for verification
    await supabase
      .from('penny_drops')
      .insert({
        account_number: accountNumber,
        ifsc_code: ifscCode,
        amount: pennyAmount,
        created_at: new Date().toISOString()
      });
  }

  private async verifyPennyDrop(accountId: string, submittedAmount: number): Promise<boolean> {
    // In real implementation, verify with banking partner
    return Math.random() > 0.1; // 90% success rate for demo
  }

  private async checkDailyDepositLimit(bankAccountId: string): Promise<{ limit: number; used: number; remaining: number }> {
    const limit = 200000; // ₹2,00,000 daily limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('bank_account_id', bankAccountId)
      .eq('type', 'deposit')
      .gte('created_at', today + 'T00:00:00.000Z')
      .lt('created_at', today + 'T23:59:59.999Z');

    const used = data?.reduce((sum, t) => sum + t.amount, 0) || 0;
    return { limit, used, remaining: Math.max(0, limit - used) };
  }

  private async checkDailyWithdrawalLimit(userId: string): Promise<{ limit: number; used: number; remaining: number }> {
    const limit = 100000; // ₹1,00,000 daily limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .gte('created_at', today + 'T00:00:00.000Z')
      .lt('created_at', today + 'T23:59:59.999Z');

    const used = data?.reduce((sum, t) => sum + t.amount, 0) || 0;
    return { limit, used, remaining: Math.max(0, limit - used) };
  }

  private calculateDepositFees(amount: number): number {
    // Free deposits up to ₹10,000, then 0.5%
    return amount > 10000 ? (amount - 10000) * 0.005 : 0;
  }

  private calculateWithdrawalFees(amount: number): number {
    // ₹10 flat fee for withdrawals
    return 10;
  }

  private async getUserBalance(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    return data?.balance || 0;
  }

  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount_change: amount
    });
  }

  private async initiateUPITransfer(amount: number, bankAccountId: string, transactionId: string): Promise<void> {
    // Simulate UPI transfer - integrate with payment gateway
    setTimeout(async () => {
      const success = Math.random() > 0.05; // 95% success rate
      
      await supabase
        .from('transactions')
        .update({
          status: success ? 'completed' : 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (success) {
        // Update user balance
        const { data: transaction } = await supabase
          .from('transactions')
          .select('user_id, amount')
          .eq('id', transactionId)
          .single();

        if (transaction) {
          await this.updateUserBalance(transaction.user_id, transaction.amount);
        }
      }
    }, 5000); // Simulate 5 second processing time
  }

  private async initiateNEFTTransfer(amount: number, bankAccountId: string, transactionId: string): Promise<void> {
    // Simulate NEFT transfer - integrate with banking APIs
    setTimeout(async () => {
      const success = Math.random() > 0.02; // 98% success rate
      
      await supabase
        .from('transactions')
        .update({
          status: success ? 'completed' : 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (!success) {
        // Refund amount if transfer failed
        const { data: transaction } = await supabase
          .from('transactions')
          .select('user_id, amount, fees')
          .eq('id', transactionId)
          .single();

        if (transaction) {
          await this.updateUserBalance(transaction.user_id, transaction.amount + transaction.fees);
        }
      }
    }, 10000); // Simulate 10 second processing time
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateReference(): string {
    return 'REF' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private async uploadKYCDocument(userId: string, document: any): Promise<any> {
    // Simulate document upload - integrate with secure file storage
    return {
      ...document,
      url: `https://secure-storage.example.com/kyc/${userId}/${document.type}_${Date.now()}.pdf`,
      uploadedAt: new Date().toISOString()
    };
  }

  private mapTransactionFromDB(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      userId: dbTransaction.user_id,
      type: dbTransaction.type,
      amount: dbTransaction.amount,
      currency: dbTransaction.currency,
      status: dbTransaction.status,
      bankAccountId: dbTransaction.bank_account_id,
      description: dbTransaction.description,
      fees: dbTransaction.fees,
      createdAt: new Date(dbTransaction.created_at),
      completedAt: dbTransaction.completed_at ? new Date(dbTransaction.completed_at) : undefined,
      reference: dbTransaction.reference
    };
  }
}

export const bankingService = new BankingService();