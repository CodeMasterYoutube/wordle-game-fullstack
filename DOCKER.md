# Docker Deployment Guide

This guide explains how to run the Wordle Full-Stack application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Install Docker

#### Windows
Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

#### macOS
Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

#### Linux
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### Production Mode (Recommended for Testing)

Run the entire application with a single command:

```bash
docker-compose up
```

Or run in detached mode (background):

```bash
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

**Stop the application:**

```bash
docker-compose down
```

### Development Mode (For Active Development)

Run with hot reload enabled:

```bash
docker-compose -f docker-compose.dev.yml up
```

Or in detached mode:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Development Features:**
- Hot reload for both frontend and backend
- Source code mounted as volumes (changes reflect immediately)
- No need to rebuild images for code changes

**Stop development containers:**

```bash
docker-compose -f docker-compose.dev.yml down
```

## Detailed Commands

### Build Images

Build all images:
```bash
docker-compose build
```

Build specific service:
```bash
docker-compose build backend
docker-compose build frontend
```

Force rebuild without cache:
```bash
docker-compose build --no-cache
```

### View Logs

View logs from all services:
```bash
docker-compose logs
```

Follow logs in real-time:
```bash
docker-compose logs -f
```

View logs from specific service:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Container Management

List running containers:
```bash
docker-compose ps
```

Stop containers:
```bash
docker-compose stop
```

Start stopped containers:
```bash
docker-compose start
```

Restart containers:
```bash
docker-compose restart
```

Remove containers:
```bash
docker-compose down
```

Remove containers and volumes:
```bash
docker-compose down -v
```

### Execute Commands Inside Containers

Access backend container shell:
```bash
docker-compose exec backend sh
```

Access frontend container shell:
```bash
docker-compose exec frontend sh
```

Run npm commands:
```bash
docker-compose exec backend npm install <package>
docker-compose exec frontend npm install <package>
```

## Docker Architecture

### Services

#### Backend Service
- **Base Image**: node:18-alpine
- **Port**: 3001
- **Build Process**:
  1. Install dependencies
  2. Build TypeScript
  3. Run production server
- **Health Check**: Checks `/api/config` endpoint every 30s

#### Frontend Service
- **Base Image**: node:18-alpine (build), nginx:alpine (production)
- **Port**: 3000
- **Build Process**:
  1. Install dependencies
  2. Build React application with Webpack
  3. Serve static files with Nginx
- **Health Check**: Checks root endpoint every 30s

### Networks

- **wordle-network**: Bridge network connecting frontend and backend
- Allows services to communicate using service names as hostnames

### Volumes (Development Mode)

Development mode uses volumes for hot reload:

**Backend:**
- `./backend/src` → `/app/src` (source code)
- `node_modules` excluded to prevent conflicts

**Frontend:**
- `./frontend/src` → `/app/src` (source code)
- `./frontend/public` → `/app/public` (static files)
- `node_modules` excluded to prevent conflicts

## Environment Variables

### Production
Environment variables are set in `docker-compose.yml`:
- `NODE_ENV=production`

### Development
Environment variables are set in `docker-compose.dev.yml`:
- `NODE_ENV=development`

### Custom Environment Variables

Create a `.env` file in the project root:

```env
# Backend
BACKEND_PORT=3001

# Frontend
FRONTEND_PORT=3000
```

Reference in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "${BACKEND_PORT:-3001}:3001"
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

**Option 1: Stop existing processes**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Option 2: Change ports in docker-compose.yml**
```yaml
services:
  backend:
    ports:
      - "3002:3001"  # Access at localhost:3002
```

### Build Failures

Clear Docker cache and rebuild:
```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

### Container Won't Start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Check health status:
```bash
docker-compose ps
```

### Changes Not Reflecting (Development Mode)

Ensure volumes are mounted correctly:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Permission Issues (Linux)

If you encounter permission issues:
```bash
sudo chown -R $USER:$USER .
```

## Performance Optimization

### Multi-Stage Builds

The frontend Dockerfile uses multi-stage builds:
1. **Build stage**: Compiles the React application
2. **Production stage**: Serves static files with Nginx

This results in:
- Smaller image size
- Faster startup times
- Better security (no build tools in production)

### Layer Caching

Docker caches layers to speed up builds:
1. `package.json` copied first
2. Dependencies installed
3. Source code copied last

This means dependency installation is cached if `package.json` hasn't changed.

### Image Size Comparison

- Backend: ~200MB (Alpine-based)
- Frontend: ~25MB (Nginx-based)
- Total: ~225MB

Compare to standard Node images (~900MB each).

## Production Deployment

### Using Docker Compose on Server

1. **Copy files to server:**
```bash
scp -r . user@server:/path/to/app
```

2. **SSH into server:**
```bash
ssh user@server
cd /path/to/app
```

3. **Run application:**
```bash
docker-compose up -d
```

4. **Set up reverse proxy (optional):**

Using Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Using Docker Hub

1. **Build and tag images:**
```bash
docker build -t yourusername/wordle-backend:latest ./backend
docker build -t yourusername/wordle-frontend:latest ./frontend
```

2. **Push to Docker Hub:**
```bash
docker login
docker push yourusername/wordle-backend:latest
docker push yourusername/wordle-frontend:latest
```

3. **Pull and run on server:**
```bash
docker pull yourusername/wordle-backend:latest
docker pull yourusername/wordle-frontend:latest
docker-compose up -d
```

### Using Docker Swarm

Initialize swarm:
```bash
docker swarm init
```

Deploy stack:
```bash
docker stack deploy -c docker-compose.yml wordle
```

Scale services:
```bash
docker service scale wordle_backend=3
```

## Maintenance

### Update Application

1. **Pull latest code:**
```bash
git pull
```

2. **Rebuild and restart:**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### View Resource Usage

```bash
docker stats
```

### Clean Up

Remove unused images:
```bash
docker image prune -a
```

Remove unused volumes:
```bash
docker volume prune
```

Remove everything:
```bash
docker system prune -a --volumes
```

## Health Checks

Both services include health checks:

**Backend Health Check:**
- Endpoint: `http://localhost:3001/api/config`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start Period: 40 seconds

**Frontend Health Check:**
- Endpoint: `http://localhost:3000`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start Period: 40 seconds

View health status:
```bash
docker-compose ps
```

## Advantages of Docker Deployment

✅ **Consistency**: Same environment everywhere (dev, test, prod)
✅ **Isolation**: No dependency conflicts
✅ **Portability**: Run anywhere Docker is installed
✅ **Scalability**: Easy to scale services
✅ **Quick Setup**: One command to start everything
✅ **Easy Cleanup**: Remove everything with one command
✅ **Version Control**: Infrastructure as code
✅ **Resource Efficiency**: Lightweight compared to VMs

## Comparison: Docker vs Manual Setup

| Aspect | Docker | Manual Setup |
|--------|--------|--------------|
| Setup Time | 2 minutes | 10-15 minutes |
| Dependencies | None (included in images) | Node.js, npm required |
| Environment | Consistent | Varies by system |
| Cleanup | `docker-compose down` | Manual uninstall |
| Multiple Versions | Easy (different images) | Complex |
| Deployment | Same everywhere | System-specific |

## Next Steps

- Configure environment variables for your setup
- Set up CI/CD pipeline with Docker
- Deploy to cloud platforms (AWS, GCP, Azure)
- Implement container orchestration (Kubernetes)
- Add monitoring and logging solutions
