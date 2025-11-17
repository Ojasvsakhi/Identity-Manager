# Jenkins Setup for Windows

## Prerequisites

1. **Docker Desktop must be running**
   - Open Docker Desktop application
   - Wait until it shows "Docker Desktop is running" in the system tray
   - Verify by running: `docker ps`

2. **Enable WSL 2 Backend (Recommended)**
   - Docker Desktop → Settings → General
   - Check "Use the WSL 2 based engine"
   - Apply & Restart

## Quick Start

### Step 1: Verify Docker is Running

```powershell
# Check Docker is running
docker ps

# If you get an error, start Docker Desktop first
```

### Step 2: Start Jenkins

```powershell
# For Windows with Docker Desktop
docker-compose -f docker-compose.jenkins.yml up -d

# OR if using WSL2 backend
docker-compose -f docker-compose.jenkins.wsl2.yml up -d
```

### Step 3: Get Initial Password

```powershell
# Wait a few seconds for Jenkins to start, then:
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Step 4: Access Jenkins

1. Open browser: `http://localhost:8080`
2. Paste the password from Step 3
3. Click "Install suggested plugins"
4. Create admin user

## Troubleshooting

### Error: "The system cannot find the file specified"

**Solution**: Docker Desktop is not running
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)
3. Try the command again

### Error: "unable to get image"

**Solution**: Docker daemon is not accessible
```powershell
# Restart Docker Desktop
# Or restart Docker service:
Restart-Service docker
```

### Jenkins can't access Docker

If Jenkins pipeline fails with Docker errors:

1. **For Windows Docker Desktop**:
   - The named pipe should work automatically
   - If not, ensure Docker Desktop is using WSL 2 backend

2. **Alternative: Install Docker inside Jenkins container**
   - This requires modifying the Dockerfile (not recommended)

### Port 8080 already in use

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Change port in docker-compose.jenkins.yml
# Edit: "8081:8080" instead of "8080:8080"
```

### Jenkins container keeps restarting

```powershell
# Check logs
docker logs jenkins

# Check permissions
docker exec jenkins ls -la /var/jenkins_home

# Fix permissions if needed
docker exec jenkins chown -R jenkins:jenkins /var/jenkins_home
```

## Windows-Specific Notes

### Docker Socket Access

Windows Docker Desktop uses a named pipe (`//./pipe/docker_engine`) instead of a Unix socket. The `docker-compose.jenkins.yml` is configured for this.

### File Paths

Jenkins volumes use forward slashes in docker-compose, which Docker Desktop handles automatically.

### Performance

For better performance on Windows:
- Use WSL 2 backend in Docker Desktop
- Store Jenkins data in WSL 2 filesystem if possible
- Allocate at least 4GB RAM to Docker Desktop

## Next Steps

After Jenkins is running:

1. Install Docker Pipeline plugin (if not already installed)
2. Create a new Pipeline job
3. Point it to your repository
4. Use the `Jenkinsfile` in the root directory

See [jenkins/README.md](jenkins/README.md) for detailed pipeline setup.


