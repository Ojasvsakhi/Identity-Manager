# DevOps Quick Reference Guide

## Docker Commands

### Development

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Execute command in container
docker-compose exec backend npm test
docker-compose exec frontend npm test
docker-compose exec analysis-engine pytest
```

### Production

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop production
docker-compose -f docker-compose.prod.yml down

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Rebuild production images
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Individual Service Builds

```bash
# Build frontend
cd frontend
docker build -t identity-manager-frontend:latest -f Dockerfile.prod .

# Build backend
cd backend
docker build -t identity-manager-backend:latest -f Dockerfile.prod .

# Build analysis engine
cd analysis-engine
docker build -t identity-manager-analysis:latest -f Dockerfile.prod .
```

### Docker Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List images
docker images

# Remove unused images
docker image prune -a

# Remove all stopped containers
docker container prune

# View container logs
docker logs <container-name>

# Execute shell in container
docker exec -it <container-name> sh
```

## Jenkins Commands

### Start/Stop Jenkins

```bash
# Start Jenkins
docker-compose -f docker-compose.jenkins.yml up -d

# Stop Jenkins
docker-compose -f docker-compose.jenkins.yml down

# View Jenkins logs
docker-compose -f docker-compose.jenkins.yml logs -f jenkins

# Restart Jenkins
docker-compose -f docker-compose.jenkins.yml restart jenkins
```

### Jenkins Access

```bash
# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Access Jenkins UI
# Open browser: http://localhost:8080
```

### Jenkins Backup/Restore

```bash
# Backup Jenkins
docker exec jenkins tar czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins-backup.tar.gz ./jenkins-backup-$(date +%Y%m%d).tar.gz

# Restore Jenkins
docker cp jenkins-backup.tar.gz jenkins:/tmp/
docker exec jenkins tar xzf /tmp/jenkins-backup.tar.gz -C /
docker-compose -f docker-compose.jenkins.yml restart jenkins
```

## CI/CD Pipeline

### Manual Pipeline Trigger

1. Go to Jenkins UI: http://localhost:8080
2. Select your pipeline job
3. Click "Build Now"

### Pipeline via CLI (if Jenkins CLI enabled)

```bash
# Trigger build
java -jar jenkins-cli.jar -s http://localhost:8080 build <pipeline-name>

# Get build status
java -jar jenkins-cli.jar -s http://localhost:8080 get-build <pipeline-name> <build-number>
```

## Database Management

### PostgreSQL Commands

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d profile_management

# Run migrations (backend)
docker-compose exec backend npm run migration:run

# Backup database
docker-compose exec postgres pg_dump -U postgres profile_management > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres profile_management < backup.sql
```

## Troubleshooting

### Port Conflicts

```bash
# Check what's using a port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Change port in docker-compose.yml
# Edit ports: "8081:8080" instead of "8080:8080"
```

### Container Issues

```bash
# Inspect container
docker inspect <container-name>

# View container resource usage
docker stats

# Restart specific service
docker-compose restart <service-name>

# Remove and recreate container
docker-compose rm -f <service-name>
docker-compose up -d <service-name>
```

### Build Issues

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Clean Docker system
docker system prune -a --volumes
```

### Jenkins Issues

```bash
# Check Jenkins container status
docker ps | grep jenkins

# View Jenkins logs
docker logs jenkins

# Fix permissions
docker exec jenkins chown -R jenkins:jenkins /var/jenkins_home

# Reinstall plugins
# Go to: Manage Jenkins → Manage Plugins → Advanced → Upload Plugin
```

## Environment Setup

### Create .env file

```bash
# Copy example (if exists)
cp .env.example .env

# Or create manually with:
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=profile_management
JWT_SECRET=your_secret_key_here
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ANALYSIS_URL=http://localhost:5000
```

## Monitoring

### Health Checks

```bash
# Check all services
docker-compose ps

# Check service health
curl http://localhost:3000  # Frontend
curl http://localhost:8000  # Backend
curl http://localhost:5000  # Analysis Engine
```

### Resource Monitoring

```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
docker volume inspect <volume-name>
```

## Security

### Update Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest
docker-compose build --pull
```

### Scan Images

```bash
# Using Trivy (if installed)
trivy image identity-manager-frontend:latest
trivy image identity-manager-backend:latest
trivy image identity-manager-analysis:latest
```

## Useful Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias jenkins-up='docker-compose -f docker-compose.jenkins.yml up -d'
alias jenkins-down='docker-compose -f docker-compose.jenkins.yml down'
alias jenkins-logs='docker-compose -f docker-compose.jenkins.yml logs -f'
```

