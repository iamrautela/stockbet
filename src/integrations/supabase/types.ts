export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata_json?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          id: string
          strategy_id: string
          win_rate: number | null
          sharpe: number | null
          max_drawdown: number | null
          total_trades: number | null
          returns: number | null
          equity_curve_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          strategy_id: string
          win_rate?: number | null
          sharpe?: number | null
          max_drawdown?: number | null
          total_trades?: number | null
          returns?: number | null
          equity_curve_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          strategy_id?: string
          win_rate?: number | null
          sharpe?: number | null
          max_drawdown?: number | null
          total_trades?: number | null
          returns?: number | null
          equity_curve_json?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backtest_results_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          }
        ]
      }
      bets: {
        Row: {
          bet_type: string
          created_at: string
          current_price: number | null
          entry_price: number
          exit_price: number | null
          expiry: string
          id: string
          market: string
          pnl: number | null
          pnl_percent: number | null
          settled_at: string | null
          stake: number
          status: string
          stock_name: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bet_type: string
          created_at?: string
          current_price?: number | null
          entry_price: number
          exit_price?: number | null
          expiry?: string
          id?: string
          market?: string
          pnl?: number | null
          pnl_percent?: number | null
          settled_at?: string | null
          stake: number
          status?: string
          stock_name: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bet_type?: string
          created_at?: string
          current_price?: number | null
          entry_price?: number
          exit_price?: number | null
          expiry?: string
          id?: string
          market?: string
          pnl?: number | null
          pnl_percent?: number | null
          settled_at?: string | null
          stake?: number
          status?: string
          stock_name?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ipo_bets: {
        Row: {
          id: string
          user_id: string
          ipo_id: string
          prediction: string
          stake: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ipo_id: string
          prediction: string
          stake: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ipo_id?: string
          prediction?: string
          stake?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_bets_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          }
        ]
      }
      ipos: {
        Row: {
          id: string
          company: string
          symbol: string | null
          exchange: string | null
          sector: string | null
          listing_date: string | null
          price_band_low: number | null
          price_band_high: number | null
          status: string
          sentiment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company: string
          symbol?: string | null
          exchange?: string | null
          sector?: string | null
          listing_date?: string | null
          price_band_low?: number | null
          price_band_high?: number | null
          status?: string
          sentiment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company?: string
          symbol?: string | null
          exchange?: string | null
          sector?: string | null
          listing_date?: string | null
          price_band_low?: number | null
          price_band_high?: number | null
          status?: string
          sentiment?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          user_id: string
          display_name: string | null
          avatar_url: string | null
          preferred_market: string
          created_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          preferred_market?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          preferred_market?: string
          created_at?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          id: string
          user_id: string
          name: string
          rules_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          rules_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          rules_json?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          bet_id: string | null
          created_at: string
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          bet_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          bet_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          symbol: string
          market: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          market: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          market?: string
          added_at?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          in_bets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          in_bets?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          in_bets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deposit_funds: {
        Args: { p_amount: number }
        Returns: undefined
      }
      get_expired_bets: {
        Args: never
        Returns: {
          id: string
          market: string
          symbol: string
        }[]
      }
      has_role: {
        Args: { p_user_id: string; p_role: string }
        Returns: boolean
      }
      place_bet: {
        Args: {
          p_bet_type: string
          p_entry_price: number
          p_expiry: string
          p_market: string
          p_stake: number
          p_stock_name: string
          p_symbol: string
        }
        Returns: string
      }
      place_bet_with_wallet: {
        Args: {
          p_symbol: string
          p_market: string
          p_direction: string
          p_stake: number
          p_entry_price: number
          p_target_price: number
        }
        Returns: string
      }
      settle_bet: {
        Args: { p_bet_id: string; p_exit_price: number }
        Returns: undefined
      }
      withdraw_funds: {
        Args: { p_amount: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
