import { apiService } from './api';

export interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface KYC {
  id: number;
  user_id: number;
  document_type: string;
  document_number: string;
  status: string;
  submitted_at: string;
}

export interface KYCCreate {
  document_type: string;
  document_number: string;
}

class BankingService {
  async submitKYC(kycData: KYCCreate): Promise<KYC> {
    try {
      const kyc = await apiService.post('/banking/kyc', kycData);
      return kyc;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      const transactions = await apiService.get('/banking/transactions');
      return transactions;
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  async getKYCStatus(): Promise<{ status: string; documents?: any[] }> {
    try {
      // For now, we'll return a default status
      // You might want to add a specific endpoint for this
      return { status: 'pending', documents: [] };
    } catch (error: any) {
      console.error('Error fetching KYC status:', error);
      return { status: 'pending', documents: [] };
    }
  }
}

export const bankingService = new BankingService(); 