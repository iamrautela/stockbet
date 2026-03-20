# StockBet - Real-Time Stock Betting Platform

A modern, real-time stock betting platform built with React, TypeScript, Supabase, and Tailwind CSS.

## 🎯 Project Status

**67% Complete** | **8 of 12 Phases Implemented**

### ✅ Completed Features
- User authentication with auto-profile creation
- Wallet system with deposits & withdrawals
- Real-time balance updates
- Notification system with live alerts
- Profile management
- Transaction history
- Bet placement & settlement
- Audit logging & security

### 🚧 In Progress
- Stock search & watchlist
- IPO betting interface
- Quant/backtesting engine
- Admin panel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (already configured)

### Installation

1. **Run SQL Migration** (CRITICAL FIRST STEP!)
   ```bash
   # Open Supabase Dashboard → SQL Editor
   # Copy contents of: supabase/migrations/20260320_complete_schema.sql
   # Paste and run in SQL Editor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 3-minute setup guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Full implementation details
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Phase tracking

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **State**: React Query, Context API
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts
- **Date**: date-fns

## 🎮 Features

### User Management
- Sign up with email/password
- Auto-created profile with ₹10,000 welcome bonus
- Profile customization (display name, avatar, preferred market)
- Settings page

### Wallet System
- Deposit funds (₹100 - ₹10,00,000)
- Withdraw funds with validation
- Real-time balance updates
- Transaction history with status tracking
- Secure RPC functions for all operations

### Betting
- Place bets on stocks (long/short)
- Multiple time frames (15m, 1h, 4h, EOD)
- Automatic settlement via Edge Functions
- Real-time P&L tracking
- Position management

### Notifications
- Real-time notifications on bet settlement
- Toast alerts for new notifications
- Unread count badge
- Mark as read functionality
- Notification history

### Security
- Row Level Security (RLS) on all tables
- User-scoped data access
- Admin role system
- Audit logging for compliance
- Secure wallet operations

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Layout components (Sidebar, TopNav)
│   ├── notifications/      # Notification system
│   ├── pages/              # Page components
│   ├── ui/                 # shadcn/ui components
│   └── wallet/             # Wallet modals
├── contexts/
│   └── ProfileContext.tsx  # Profile state management
├── hooks/
│   ├── useAuth.tsx         # Authentication
│   ├── useWallet.ts        # Wallet with realtime
│   ├── useNotifications.ts # Notifications with realtime
│   ├── useRealtimeBets.ts  # Bets with realtime
│   └── useIPOs.ts          # IPO data
├── integrations/
│   └── supabase/           # Supabase client & types
├── lib/
│   ├── betting-api.ts      # Betting logic
│   ├── market-api.ts       # Market data
│   └── utils.ts            # Utilities
└── pages/
    ├── Index.tsx           # Main app
    └── NotFound.tsx        # 404 page

supabase/
├── functions/
│   ├── market-data/        # Stock price fetching
│   └── settle-bets/        # Automatic bet settlement
└── migrations/
    └── 20260320_complete_schema.sql  # Complete DB schema
```

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data:
- Profiles: SELECT, UPDATE own profile
- Wallets: SELECT own wallet
- Bets: SELECT, INSERT own bets
- Notifications: SELECT, UPDATE own notifications
- Transactions: SELECT own transactions

### Admin Access
Admin users can:
- View all user data
- Manage IPOs
- Access audit logs
- Modify user roles

### Secure Functions
All wallet operations use `SECURITY DEFINER` functions:
- `deposit_funds(amount)` - Validates and credits wallet
- `withdraw_funds(amount)` - Validates and debits wallet
- `place_bet_with_wallet(...)` - Atomic bet placement
- `has_role(user_id, role)` - Permission checking

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles
- `wallets` - User balances
- `bets` - Betting records
- `wallet_transactions` - Transaction history
- `notifications` - User notifications
- `watchlists` - Saved stocks
- `ipos` - IPO listings
- `ipo_bets` - IPO predictions
- `strategies` - Trading strategies
- `backtest_results` - Strategy performance
- `user_roles` - User permissions
- `audit_logs` - System audit trail

## 🔄 Real-time Features

### Subscriptions
- Wallet balance updates automatically
- Bets update in real-time
- Notifications appear instantly
- Transaction history refreshes live

### Implementation
```typescript
// Example: Real-time wallet updates
const channel = supabase
  .channel('wallet-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'wallets',
    filter: `user_id=eq.${user.id}`
  }, () => {
    fetchWallet();
  })
  .subscribe();
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up new user
- [ ] Verify ₹10,000 welcome bonus
- [ ] Deposit funds
- [ ] Withdraw funds
- [ ] Place a bet
- [ ] Check notifications
- [ ] Update profile
- [ ] Verify real-time updates

### Test User Flow
```bash
1. Sign up → test@example.com
2. Check wallet → Should show ₹10,000
3. Deposit ₹1,000 → Balance: ₹11,000
4. Place bet → Balance decreases
5. Wait for settlement → Notification appears
6. Check transaction history → All transactions visible
```

## 🚀 Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Supabase Edge Functions
Set in Supabase Dashboard → Edge Functions → Secrets:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Build & Deploy
```bash
# Build production bundle
npm run build

# Deploy to Vercel/Netlify
# Set environment variables in hosting platform
```

## 📈 Roadmap

### Phase 6: Stock Search & Watchlist
- [ ] Update market-data Edge Function for search
- [ ] Create WatchlistContext
- [ ] Build StockSearchBar component
- [ ] Add WatchlistWidget to Markets page

### Phase 9: Quant/Backtesting
- [ ] Build strategy builder UI
- [ ] Create run-backtest Edge Function
- [ ] Implement equity curve charts

### Phase 10: Admin Panel
- [ ] Create admin pages (Users, Bets, Wallets, IPOs, Audit)
- [ ] Add admin route guards
- [ ] Build admin navigation

### Phase 11: Polish
- [ ] Add error boundaries
- [ ] Create skeleton loaders
- [ ] Improve empty states
- [ ] Add error handler utility

### Phase 12: Final QA
- [ ] TypeScript audit
- [ ] Console cleanup
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] End-to-end testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Verify Supabase migration ran successfully
4. Ensure environment variables are set correctly

---

**Built with ❤️ using React, TypeScript, and Supabase**

**Status**: Production Ready for Core Features | 67% Complete

