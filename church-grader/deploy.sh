#!/bin/bash

echo "🚀 Church Chatbot Grader Deployment Script"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the church-grader directory"
    exit 1
fi

echo "✅ Repository structure looks good"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Committing them..."
    git add .
    git commit -m "Update for deployment"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy backend to Railway/Render/Heroku (see DEPLOYMENT.md)"
echo "2. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'church-grader'"
echo "   - Add environment variable: NEXT_PUBLIC_BACKEND_URL=<your-backend-url>"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
