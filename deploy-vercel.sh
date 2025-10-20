#!/bin/bash

# ==========================================
# Cidadão.AI Dashboard - Vercel Deploy Script
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo "================================================"
echo "  🚀 Cidadão.AI Dashboard - Vercel Deployment"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm i -g vercel
    print_success "Vercel CLI installed successfully!"
else
    print_status "Vercel CLI already installed"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Installing..."
    npm install
    print_success "Dependencies installed!"
else
    print_status "Dependencies already installed"
fi

# Run type check
print_status "Running type check..."
npm run type-check || {
    print_warning "Type check failed. Some types may need attention."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Run linting
print_status "Running linter..."
npm run lint || {
    print_warning "Linting failed. Some code may need formatting."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Test build locally
print_status "Testing build locally..."
npm run build || {
    print_error "Build failed! Please fix errors before deploying."
    exit 1
}
print_success "Build successful!"

# Ask for deployment type
echo ""
echo "Select deployment type:"
echo "1) Production (--prod)"
echo "2) Preview"
echo "3) Development"
read -p "Enter your choice (1-3): " deploy_choice

case $deploy_choice in
    1)
        DEPLOY_FLAG="--prod"
        ENV_FLAG="production"
        print_status "Deploying to PRODUCTION..."
        ;;
    2)
        DEPLOY_FLAG=""
        ENV_FLAG="preview"
        print_status "Deploying to PREVIEW..."
        ;;
    3)
        DEPLOY_FLAG=""
        ENV_FLAG="development"
        print_status "Deploying to DEVELOPMENT..."
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Check for .vercel directory (project linked)
if [ ! -d ".vercel" ]; then
    print_warning "Project not linked to Vercel. Running setup..."
    vercel link || {
        print_error "Failed to link project. Please run 'vercel' manually."
        exit 1
    }
fi

# Deploy to Vercel
print_status "Starting deployment to Vercel..."
echo ""

# Set environment variables
print_status "Setting environment variables..."
vercel env add NEXT_PUBLIC_API_URL production preview development <<< "https://cidadao-api-production.up.railway.app" 2>/dev/null || true
vercel env add NEXT_PUBLIC_ENABLE_REAL_API production <<< "true" 2>/dev/null || true
vercel env add NEXT_PUBLIC_USE_MOCK_DATA preview development <<< "true" 2>/dev/null || true

# Run deployment
if [ "$ENV_FLAG" == "production" ]; then
    # For production, ask for confirmation
    echo ""
    print_warning "⚠️  You are about to deploy to PRODUCTION!"
    read -p "Are you sure? Type 'yes' to continue: " confirm
    if [ "$confirm" != "yes" ]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# Deploy
vercel $DEPLOY_FLAG --yes || {
    print_error "Deployment failed!"
    exit 1
}

# Success message
echo ""
echo "================================================"
print_success "🎉 Deployment Successful!"
echo "================================================"
echo ""
print_status "Your dashboard is being deployed to Vercel."
print_status "You can monitor the deployment at: https://vercel.com/dashboard"
echo ""

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --json 2>/dev/null | grep -o '"url":"[^"]*' | grep -o '[^"]*$' | head -n 1)

if [ ! -z "$DEPLOYMENT_URL" ]; then
    print_success "Deployment URL: https://$DEPLOYMENT_URL"
    echo ""

    # Ask if user wants to open the URL
    read -p "Open in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://$DEPLOYMENT_URL"
        elif command -v open &> /dev/null; then
            open "https://$DEPLOYMENT_URL"
        else
            print_warning "Could not open browser automatically."
        fi
    fi
fi

# Final instructions
echo ""
echo "📋 Next Steps:"
echo "1. Visit your Vercel dashboard to monitor the deployment"
echo "2. Configure custom domain if needed"
echo "3. Set up environment variables in Vercel dashboard"
echo "4. Enable Analytics and Speed Insights"
echo ""
print_success "Happy monitoring! 🚀"