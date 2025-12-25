#!/bin/bash
# Run test suite for AstroMirror Voice Chat Backend

set -e

echo "🧪 Running AstroMirror Voice Chat Backend Tests..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run pytest with coverage
echo "📊 Running tests with coverage..."
pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

echo ""
echo "✅ All tests completed!"
echo "📈 Coverage report generated: htmlcov/index.html"
