FROM node:20.10.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install pnpm
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

# Copy all files
COPY . .

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV NODE_ENV production

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]

# Nginx stage for reverse proxy
FROM nginx:alpine AS nginx

# Install openssl for generating self-signed certificates
RUN apk add --no-cache openssl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates if they exist (ignore errors if missing)
COPY nginx/ssl/*.pem /etc/nginx/ssl/ 2>/dev/null || true
COPY nginx/ssl/*.crt /etc/nginx/ssl/ 2>/dev/null || true
COPY nginx/ssl/*.key /etc/nginx/ssl/ 2>/dev/null || true

# Generate self-signed certificate if cert.pem doesn't exist
RUN if [ ! -f /etc/nginx/ssl/cert.pem ]; then \
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"; \
    fi

# Set proper permissions for SSL files
RUN chmod 600 /etc/nginx/ssl/* 2>/dev/null || true

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]