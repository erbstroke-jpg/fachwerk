#!/bin/bash
# deploy.sh — First-time deploy script
# Usage: ./scripts/deploy.sh yourdomain.kg admin@email.com

set -e

DOMAIN=${1:?"Usage: $0 <domain> <email>"}
EMAIL=${2:?"Usage: $0 <domain> <email>"}

echo "==> Deploying Fachwerk IssykKul to $DOMAIN"

# 1. Check .env exists
if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example and fill in values."
  exit 1
fi

# 2. Start nginx only (for certbot challenge)
echo "==> Starting nginx for certbot challenge..."
docker compose up -d nginx

# 3. Issue certificate (webroot)
echo "==> Issuing Let's Encrypt certificate..."
docker run --rm \
  -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
  -v "$(pwd)/nginx/certs:/etc/letsencrypt" \
  certbot/certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Copy certs
mkdir -p nginx/certs
cp nginx/certs/live/$DOMAIN/fullchain.pem nginx/certs/fullchain.pem
cp nginx/certs/live/$DOMAIN/privkey.pem   nginx/certs/privkey.pem

# 4. Update domain in nginx.conf
sed -i "s/yourdomain.kg/$DOMAIN/g" nginx/nginx.conf

# 5. Start all services
echo "==> Starting all services..."
docker compose up -d --build

echo ""
echo "✅ Deployed! https://$DOMAIN"
echo "   Admin panel: https://$DOMAIN/admin"
echo "   API health:  https://$DOMAIN/health"
