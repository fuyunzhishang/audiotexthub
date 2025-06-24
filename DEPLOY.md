# AudioTextHub Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Speech Recognition API endpoint available

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd audiotexthub
   ```

2. **Set up environment variables**
   ```bash
   cp .env.docker.example .env
   # Edit .env file with your actual values
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   Or build and run manually:
   ```bash
   # Build the image
   docker build -t audiotexthub .
   
   # Run the container
   docker run -d \
     -p 3000:3000 \
     --env-file .env \
     --name audiotexthub \
     audiotexthub
   ```

4. **Access the application**
   Open http://localhost:3000 in your browser

### Environment Variables

Required variables:
- `NEXT_PUBLIC_API_URL`: Speech Recognition API endpoint (e.g., http://your-api:3099)
- `AUTH_SECRET`: Authentication secret (generate with `openssl rand -base64 32`)

Optional variables:
- See `.env.docker.example` for all available options

### Production Deployment

For production deployment:

1. Update `NEXT_PUBLIC_WEB_URL` to your actual domain
2. Set up a reverse proxy (nginx, traefik, etc.)
3. Configure SSL/TLS certificates
4. Set up proper logging and monitoring

### Updating

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Troubleshooting

1. **Container won't start**
   - Check logs: `docker-compose logs app`
   - Verify all required environment variables are set

2. **Speech recognition not working**
   - Verify `NEXT_PUBLIC_API_URL` is correct and accessible
   - Check API logs and network connectivity

3. **Performance issues**
   - Increase Docker memory allocation
   - Check if standalone build is working correctly