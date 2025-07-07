# 🚀 Deploy StockBet to Vercel - Simple Guide

## Prerequisites
- Node.js installed
- Git repository with your code
- Vercel account (free at vercel.com)

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy Your App
```bash
# From your project directory
vercel
```

## Step 4: Set Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

### Required Variables:
```
VITE_SUPABASE_URL=https://qtrjpqgdovpqbggxekmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cmpwcWdkb3ZwcWJnZ3hla21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzczMDgsImV4cCI6MjA2NTQ1MzMwOH0.yRndqj1G2z9aA6K0jryI6n_6hK8uYz3cf0ys1U-20hM
VITE_ENVIRONMENT=production
```

### Optional Variables (for enhanced features):
```
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
VITE_POLYGON_API_KEY=your_polygon_api_key
VITE_FINNHUB_API_KEY=your_finnhub_api_key
```

## Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## 🎉 You're Done!
Your app will be live at: `https://your-app-name.vercel.app`

## 🔄 Automatic Deployments
Push to your main branch to trigger automatic deployments:
```bash
git add .
git commit -m "Update app"
git push
```

## 📱 Custom Domain (Optional)
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

## 🛠️ Troubleshooting

### Build Errors
```bash
# Check build locally first
npm run build

# Fix any TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

### Environment Variables Not Working
- Make sure variables start with `VITE_`
- Redeploy after adding variables: `vercel --prod`

### Authentication Issues
- Check Supabase project settings
- Add your Vercel domain to Supabase allowed origins

## 📊 Monitor Your App
- View analytics in Vercel Dashboard
- Check build logs for errors
- Monitor performance metrics

---
**Your StockBet app is now live! 🎯** 