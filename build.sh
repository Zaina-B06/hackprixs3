#!/usr/bin/env bash
# build.sh — Render build script for CourtSaarthi
# Builds React frontend and installs Python backend dependencies

set -o errexit  # exit on error

echo "=== Installing frontend dependencies ==="
cd courtsaarthi
npm install

echo "=== Building React frontend ==="
npm run build
cd ..

echo "=== Installing backend dependencies ==="
cd backend
pip install -r requirements.txt
cd ..

echo "=== Build complete ==="
