#!/bin/bash

# Cidadão.AI Dashboard - Quick Setup Script
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo "🚀 Cidadão.AI Dashboard Setup"
echo "================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Cidadão.AI API Configuration
CIDADAO_API_BASE=https://cidadao-api-production.up.railway.app
# CIDADAO_API_KEY=your_api_key_here

# Optional: Database connection
# DATABASE_URL=postgresql://user:pass@host:5432/cidadao

# Optional: Prometheus endpoint
# PROMETHEUS_URL=http://localhost:9090

# Optional: Redis cache
# REDIS_URL=redis://localhost:6379
# REDIS_TOKEN=your_token_here
EOF
    echo "✅ Created .env.local (configure as needed)"
else
    echo "ℹ️  .env.local already exists, skipping..."
fi

echo ""
echo "================================"
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure .env.local with your API keys (if needed)"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "Commands:"
echo "  npm run dev       - Start development server"
echo "  npm run build     - Build for production"
echo "  npm run start     - Start production server"
echo "  npm run type-check - Run TypeScript checks"
echo ""
echo "Documentation: See README.md"
echo "================================"
