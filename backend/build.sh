#!/usr/bin/env bash
# exit on error
set -o errexit

# Ensure we are in the script's directory (backend/)
cd "$(dirname "$0")"

echo "Step 1: Installing dependencies..."
pip install -r requirements.txt

echo "Step 2: Collecting static files..."
python manage.py collectstatic --no-input

echo "Step 3: Running migrations..."
python manage.py migrate

echo "Step 4: Seeding test accounts..."
python manage.py seed_accounts

echo "Build successful!"
