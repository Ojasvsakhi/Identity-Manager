# Jenkins Setup Guide

This guide will help you set up Jenkins for CI/CD with the Identity Manager project.

## Prerequisites

- Docker and Docker Compose installed
- Git repository access
- At least 4GB RAM available for Jenkins

## Quick Start

### 1. Start Jenkins

```bash
docker-compose -f docker-compose.jenkins.yml up -d
```

### 2. Access Jenkins

1. Open your browser and navigate to `http://localhost:8080`
2. Get the initial admin password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Copy the password and paste it into the Jenkins setup page

### 3. Install Suggested Plugins

- Click "Install suggested plugins"
- Wait for installation to complete
- Create an admin user or continue with admin account

### 4. Configure Jenkins for Docker

#### Install Docker Plugin (if not already installed)

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Search for "Docker Pipeline" and "Docker"
3. Install without restart

#### Configure Docker

1. Go to **Manage Jenkins** → **Configure System**
2. Scroll to **Cloud** section
3. Add a new **Docker** cloud configuration:
   - Name: `docker`
   - Docker Host URI: `unix:///var/run/docker.sock`
   - Test Connection

### 5. Create Jenkins Pipeline

#### Option A: Using Jenkinsfile (Recommended)

1. Go to **New Item**
2. Enter a name (e.g., "Identity-Manager-Pipeline")
3. Select **Pipeline**
4. Click **OK**
5. In **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: Your repository URL
   - Credentials: Add if private repo
   - Branch: `*/main` or `*/develop`
   - Script Path: `Jenkinsfile`
6. Click **Save**

#### Option B: Manual Pipeline Configuration

1. Go to **New Item** → **Pipeline**
2. In **Pipeline** section, paste the pipeline script from `Jenkinsfile`
3. Click **Save**

### 6. Configure Credentials (Optional)

If using Docker registry:

1. Go to **Manage Jenkins** → **Credentials**
2. Add credentials:
   - Kind: **Secret text** or **Username with password**
   - ID: `docker-registry-url`
   - Add your Docker registry URL/credentials

### 7. Run Pipeline

1. Click on your pipeline
2. Click **Build Now**
3. Monitor the build progress in **Build History**

## Pipeline Stages

The Jenkinsfile includes the following stages:

1. **Checkout**: Clones the repository
2. **Lint & Code Quality**: Runs linting for all services
3. **Test**: Runs unit tests for frontend, backend, and analysis-engine
4. **Build Docker Images**: Builds and tags Docker images
5. **Security Scan**: Scans Docker images for vulnerabilities
6. **Deploy to Staging**: Auto-deploys when on `develop` branch
7. **Deploy to Production**: Auto-deploys when on `main` branch

## Environment Variables

Set these in Jenkins → Manage Jenkins → Configure System → Global properties:

- `DOCKER_REGISTRY`: Your Docker registry URL (default: localhost:5000)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password (use credentials binding)
- `JWT_SECRET`: JWT secret key

## Troubleshooting

### Jenkins can't access Docker

```bash
# Add Jenkins user to docker group (if running on host)
sudo usermod -aG docker jenkins

# Or ensure Docker socket is mounted in docker-compose
```

### Build fails with permission errors

```bash
# Fix permissions
docker exec jenkins chown -R jenkins:jenkins /var/jenkins_home
```

### Pipeline can't find Docker

Ensure Docker is installed in the Jenkins container or use Docker-in-Docker (already configured in docker-compose.jenkins.yml).

## Best Practices

1. **Use Blue Ocean**: Install Blue Ocean plugin for better pipeline visualization
2. **Credentials Management**: Store secrets in Jenkins credentials, never in code
3. **Branch Strategy**: Use `main` for production, `develop` for staging
4. **Notifications**: Configure email/Slack notifications for build status
5. **Backup**: Regularly backup `/var/jenkins_home` volume

## Backup Jenkins

```bash
# Backup Jenkins home directory
docker exec jenkins tar czf /tmp/jenkins-backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz
```

## Restore Jenkins

```bash
# Restore from backup
docker cp jenkins-backup.tar.gz jenkins:/tmp/
docker exec jenkins tar xzf /tmp/jenkins-backup.tar.gz -C /
```

