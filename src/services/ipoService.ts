import { supabase } from './auth';
import { IPOData, MergerData } from '../types';

export interface IPOServiceInterface {
  getUpcomingIPOs(): Promise<IPOData[]>;
  getIPODetails(ipoId: string): Promise<IPOData | null>;
  placeBidOnIPO(ipoId: string, quantity: number, pricePerShare: number): Promise<{ success: boolean; error?: string }>;
  getIPOAllotmentStatus(userId: string, ipoId: string): Promise<{ allotted: boolean; quantity?: number; refundAmount?: number }>;
  getGMPData(symbol: string): Promise<{ gmp: number; lastUpdated: Date } | null>;
  subscribeToIPOUpdates(ipoId: string, callback: (data: any) => void): () => void;
}

export interface MergerServiceInterface {
  getActiveMergers(): Promise<MergerData[]>;
  getMergerDetails(mergerId: string): Promise<MergerData | null>;
  placeMergerBet(mergerId: string, betType: 'completion' | 'failure', amount: number): Promise<{ success: boolean; error?: string }>;
  getMergerProbability(mergerId: string): Promise<{ probability: number; factors: string[] }>;
}

class IPOService implements IPOServiceInterface {
  async getUpcomingIPOs(): Promise<IPOData[]> {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .in('status', ['upcoming', 'open'])
        .order('open_date', { ascending: true });

      if (error) throw error;

      return data.map(this.mapIPOFromDB);
    } catch (error) {
      console.error('Error fetching upcoming IPOs:', error);
      return this.getMockIPOData();
    }
  }

  async getIPODetails(ipoId: string): Promise<IPOData | null> {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .eq('id', ipoId)
        .single();

      if (error) throw error;

      return this.mapIPOFromDB(data);
    } catch (error) {
      console.error('Error fetching IPO details:', error);
      return null;
    }
  }

  async placeBidOnIPO(ipoId: string, quantity: number, pricePerShare: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get IPO details
      const ipo = await this.getIPODetails(ipoId);
      if (!ipo) {
        return { success: false, error: 'IPO not found' };
      }

      // Validate bid
      if (ipo.status !== 'open') {
        return { success: false, error: 'IPO bidding is not currently open' };
      }

      if (pricePerShare < ipo.priceRange.min || pricePerShare > ipo.priceRange.max) {
        return { success: false, error: `Price must be between ₹${ipo.priceRange.min} and ₹${ipo.priceRange.max}` };
      }

      if (quantity % ipo.lotSize !== 0) {
        return { success: false, error: `Quantity must be in multiples of ${ipo.lotSize}` };
      }

      const totalAmount = quantity * pricePerShare;
      const userBalance = await this.getUserBalance(user.user.id);

      if (totalAmount > userBalance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Place bid
      const { error } = await supabase
        .from('ipo_bids')
        .insert({
          user_id: user.user.id,
          ipo_id: ipoId,
          quantity,
          price_per_share: pricePerShare,
          total_amount: totalAmount,
          status: 'submitted',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Block amount from user balance
      await this.updateUserBalance(user.user.id, -totalAmount);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getIPOAllotmentStatus(userId: string, ipoId: string): Promise<{ allotted: boolean; quantity?: number; refundAmount?: number }> {
    try {
      const { data, error } = await supabase
        .from('ipo_allotments')
        .select('*')
        .eq('user_id', userId)
        .eq('ipo_id', ipoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return { allotted: false };
      }

      return {
        allotted: data.quantity > 0,
        quantity: data.quantity,
        refundAmount: data.refund_amount
      };
    } catch (error) {
      console.error('Error fetching IPO allotment status:', error);
      return { allotted: false };
    }
  }

  async getGMPData(symbol: string): Promise<{ gmp: number; lastUpdated: Date } | null> {
    try {
      // Mock GMP data - in real implementation, fetch from grey market data providers
      const gmp = Math.floor(Math.random() * 200) - 50; // -50 to +150
      return {
        gmp,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching GMP data:', error);
      return null;
    }
  }

  subscribeToIPOUpdates(ipoId: string, callback: (data: any) => void): () => void {
    const subscription = supabase
      .channel(`ipo_${ipoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ipos',
        filter: `id=eq.${ipoId}`
      }, callback)
      .subscribe();

    return () => subscription.unsubscribe();
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

  private mapIPOFromDB(dbIPO: any): IPOData {
    return {
      id: dbIPO.id,
      companyName: dbIPO.company_name,
      symbol: dbIPO.symbol,
      sector: dbIPO.sector,
      priceRange: dbIPO.price_range,
      lotSize: dbIPO.lot_size,
      openDate: new Date(dbIPO.open_date),
      closeDate: new Date(dbIPO.close_date),
      listingDate: new Date(dbIPO.listing_date),
      status: dbIPO.status,
      subscriptionRate: dbIPO.subscription_rate || 0,
      gmpPrice: dbIPO.gmp_price,
      financials: dbIPO.financials
    };
  }

  private getMockIPOData(): IPOData[] {
    return [
      {
        id: 'ipo_1',
        companyName: 'TechCorp India Ltd',
        symbol: 'TECHCORP',
        sector: 'Technology',
        priceRange: { min: 250, max: 300 },
        lotSize: 50,
        openDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        closeDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        listingDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        subscriptionRate: 0,
        gmpPrice: 45,
        financials: {
          revenue: 5000,
          profit: 800,
          peRatio: 25,
          roe: 18
        }
      },
      {
        id: 'ipo_2',
        companyName: 'GreenEnergy Solutions',
        symbol: 'GREENENERGY',
        sector: 'Renewable Energy',
        priceRange: { min: 180, max: 220 },
        lotSize: 75,
        openDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        closeDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        listingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: 'open',
        subscriptionRate: 2.5,
        gmpPrice: 25,
        financials: {
          revenue: 3200,
          profit: 450,
          peRatio: 22,
          roe: 15
        }
      }
    ];
  }
}

class MergerService implements MergerServiceInterface {
  async getActiveMergers(): Promise<MergerData[]> {
    try {
      const { data, error } = await supabase
        .from('mergers')
        .select('*')
        .in('status', ['announced', 'pending_approval'])
        .order('announced_date', { ascending: false });

      if (error) throw error;

      return data.map(this.mapMergerFromDB);
    } catch (error) {
      console.error('Error fetching active mergers:', error);
      return this.getMockMergerData();
    }
  }

  async getMergerDetails(mergerId: string): Promise<MergerData | null> {
    try {
      const { data, error } = await supabase
        .from('mergers')
        .select('*')
        .eq('id', mergerId)
        .single();

      if (error) throw error;

      return this.mapMergerFromDB(data);
    } catch (error) {
      console.error('Error fetching merger details:', error);
      return null;
    }
  }

  async placeMergerBet(mergerId: string, betType: 'completion' | 'failure', amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const merger = await this.getMergerDetails(mergerId);
      if (!merger) {
        return { success: false, error: 'Merger not found' };
      }

      if (merger.status === 'completed' || merger.status === 'terminated') {
        return { success: false, error: 'Merger betting is closed' };
      }

      const userBalance = await this.getUserBalance(user.user.id);
      if (amount > userBalance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Calculate odds based on merger probability
      const odds = betType === 'completion' 
        ? 1 + (1 - merger.probability / 100)
        : 1 + (merger.probability / 100);

      const { error } = await supabase
        .from('merger_bets')
        .insert({
          user_id: user.user.id,
          merger_id: mergerId,
          bet_type: betType,
          amount,
          odds,
          potential_payout: amount * odds,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      await this.updateUserBalance(user.user.id, -amount);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getMergerProbability(mergerId: string): Promise<{ probability: number; factors: string[] }> {
    try {
      const merger = await this.getMergerDetails(mergerId);
      if (!merger) {
        throw new Error('Merger not found');
      }

      // Mock probability calculation - in real implementation, use ML models
      const factors = [
        'Regulatory approval status',
        'Shareholder approval likelihood',
        'Market conditions',
        'Company financial health',
        'Antitrust concerns',
        'Strategic fit assessment'
      ];

      return {
        probability: merger.probability,
        factors
      };
    } catch (error) {
      console.error('Error calculating merger probability:', error);
      return {
        probability: 50,
        factors: ['Unable to calculate probability']
      };
    }
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

  private mapMergerFromDB(dbMerger: any): MergerData {
    return {
      id: dbMerger.id,
      acquirer: dbMerger.acquirer,
      target: dbMerger.target,
      dealValue: dbMerger.deal_value,
      currency: dbMerger.currency,
      announcedDate: new Date(dbMerger.announced_date),
      expectedClosingDate: new Date(dbMerger.expected_closing_date),
      status: dbMerger.status,
      probability: dbMerger.probability,
      premium: dbMerger.premium,
      sector: dbMerger.sector
    };
  }

  private getMockMergerData(): MergerData[] {
    return [
      {
        id: 'merger_1',
        acquirer: 'Reliance Industries',
        target: 'Future Retail',
        dealValue: 24713,
        currency: 'INR',
        announcedDate: new Date('2023-08-15'),
        expectedClosingDate: new Date('2024-06-30'),
        status: 'pending_approval',
        probability: 75,
        premium: 15.5,
        sector: 'Retail'
      },
      {
        id: 'merger_2',
        acquirer: 'Tata Group',
        target: 'BigBasket',
        dealValue: 9500,
        currency: 'INR',
        announcedDate: new Date('2023-09-20'),
        expectedClosingDate: new Date('2024-03-31'),
        status: 'announced',
        probability: 85,
        premium: 22.3,
        sector: 'E-commerce'
      }
    ];
  }
}

export const ipoService = new IPOService();
export const mergerService = new MergerService();