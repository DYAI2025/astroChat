#!/bin/bash
# Setup script for AstroMirror Voice Chat Backend

set -e

echo "🚀 Setting up AstroMirror Voice Chat Backend..."

# Check Python version
echo "📌 Checking Python version..."
python3 --version

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your actual credentials!"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Supabase and ElevenLabs credentials"
echo "2. Run database migration: migrations/002_voice_chat_schema.sql"
echo "3. Start server: uvicorn app.main:app --reload"
echo "4. Run tests: pytest"
