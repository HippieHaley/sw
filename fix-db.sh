#!/bin/bash
set -e

echo "Applying database migration..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Database fixed! Now run: npm run dev"
