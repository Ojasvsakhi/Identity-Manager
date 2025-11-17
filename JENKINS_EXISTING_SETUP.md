# Using Existing Jenkins Installation

Since you already have Jenkins installed, here's how to configure it for this project.

## Prerequisites

1. **Jenkins is running** (check `http://localhost:8080`)
2. **Docker is installed and running** (for building images)
3. **Git is installed** (for repository access)

## Setup Steps

### 1. Install Required Jenkins Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available** and install:

- **Pipeline** (workflow-aggregator)
- **Docker Pipeline** (docker-workflow)
- **Docker** (docker-plugin)
- **Git** (git)
- **GitHub** (github) - if using GitHub
- **Blue Ocean** (blueocean) - optional, for better UI
- **Credentials Binding** (credentials-binding)
- **Workspace Cleanup** (ws-cleanup)

After installation, restart Jenkins if prompted.

### 2. Configure Docker (if needed)

If Jenkins needs to access Docker:

#### Option A: Jenkins on Windows with Docker Desktop

1. Ensure Docker Desktop is running
2. Jenkins should automatically detect Docker if it's in PATH
3. Test by going to **Manage Jenkins** → **Configure System** → **Cloud** → **Add Docker**

#### Option B: Configure Docker Host

1. Go to **Manage Jenkins** → **Configure System**
2. Scroll to **Cloud** section
3. Add **Docker** cloud:
   - **Name**: `docker`
   - **Docker Host URI**: 
     - Windows: `npipe:////./pipe/docker_engine`
     - Or: `tcp://localhost:2375` (if Docker Desktop exposes TCP)
   - Test connection

### 3. Create Pipeline Job

1. Go to **New Item**
2. Enter name: `Identity-Manager-Pipeline`
3. Select **Pipeline**
4. Click **OK**

### 4. Configure Pipeline

In the pipeline configuration:

#### General Settings

- **Description**: "CI/CD Pipeline for Identity Manager"

#### Pipeline Section

- **Definition**: Select **Pipeline script from SCM**
- **SCM**: Select **Git**
- **Repository URL**: Your repository URL
  - Example: `https://github.com/yourusername/identity-manager.git`
  - Or: `file:///C:/Users/Lenovo/OneDrive/Desktop/Identity Manager` (for local repo)
- **Credentials**: Add credentials if repository is private
- **Branches to build**: 
  - `*/main` (for production)
  - `*/develop` (for staging)
  - Or `*/*` (for all branches)
- **Script Path**: 
  - `Jenkinsfile` (for Linux/Unix agents)
  - `Jenkinsfile.windows` (for Windows agents, cross-platform compatible)
- **Lightweight checkout**: Uncheck this (needed for Docker builds)

#### Build Triggers (Optional)

- **Poll SCM**: `H/5 * * * *` (check every 5 minutes)
- **GitHub hook trigger**: If using GitHub webhooks

### 5. Configure Credentials (Optional)

If you need Docker registry credentials:

1. Go to **Manage Jenkins** → **Credentials**
2. Add credentials:
   - **Kind**: Secret text or Username with password
   - **ID**: `docker-registry-url`
   - Add your Docker registry URL/credentials

### 6. Run the Pipeline

1. Click **Save**
2. Click **Build Now**
3. Monitor progress in **Build History**

## Local Repository Setup

If your repository is local (not on GitHub/GitLab):

### Option 1: Use File Path

In pipeline configuration:
- **Repository URL**: `file:///C:/Users/Lenovo/OneDrive/Desktop/Identity Manager`
- Note: Use forward slashes and three slashes after `file:`
- **Script Path**: Use `Jenkinsfile.windows` for Windows compatibility

### Option 2: Use Git Server

1. Initialize Git server on your machine (if needed)
2. Or use the repository URL directly

### Option 3: Use Git Bash/WSL (Recommended for Windows)

If you have Git Bash or WSL installed, you can use the standard `Jenkinsfile`:
- Install Git for Windows (includes Git Bash)
- Configure Jenkins to use Git Bash for shell commands
- Or use WSL agent if available

## Pipeline Customization

### Modify Jenkinsfile for Local Setup

If you're not using a Docker registry, you can modify the Jenkinsfile:

```groovy
// In Build Docker Images stage, change from:
def image = docker.build("${DOCKER_REGISTRY}/identity-manager-frontend:${IMAGE_TAG}")

// To:
def image = docker.build("identity-manager-frontend:${IMAGE_TAG}")
```

### Environment Variables

Set global environment variables in Jenkins:

1. **Manage Jenkins** → **Configure System** → **Global properties**
2. Check **Environment variables**
3. Add:
   - `DOCKER_REGISTRY` (optional, if using registry)
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET` (use credentials for sensitive values)

## Troubleshooting

### Jenkins can't find Docker

**Solution**: Ensure Docker is in system PATH
- Add Docker Desktop to PATH
- Or specify full path in Jenkinsfile

### Pipeline fails with "docker: command not found"

**Solution**: Install Docker or configure Docker path in Jenkins

### Build fails with permission errors

**Solution**: 
- On Windows, ensure Jenkins service has proper permissions
- Or run Jenkins as administrator (not recommended for production)

### Git repository not found

**Solution**:
- Check repository URL is correct
- For local repos, use `file:///` protocol
- Ensure Jenkins has access to the directory

### Docker build fails

**Solution**:
- Ensure Docker Desktop is running
- Check Docker is accessible: `docker ps` in Jenkins script console
- Verify Dockerfile paths are correct

## Testing Pipeline Locally

You can test the Jenkinsfile syntax:

1. Go to your pipeline job
2. Click **Pipeline Syntax**
3. Use **Declarative Directive Generator** to validate syntax

## Next Steps

1. **Configure webhooks** (if using Git hosting service)
2. **Set up notifications** (email, Slack, etc.)
3. **Configure deployment targets** (staging/production servers)
4. **Set up monitoring** for pipeline health

## Quick Commands

### Check Jenkins Status
```powershell
# Check if Jenkins service is running
Get-Service | Where-Object {$_.Name -like "*jenkins*"}

# Or check in browser
# http://localhost:8080
```

### View Jenkins Logs
```powershell
# Jenkins logs location (default)
# C:\Program Files\Jenkins\jenkins.err.log
# C:\Program Files\Jenkins\jenkins.out.log
```

### Restart Jenkins
```powershell
# Restart Jenkins service
Restart-Service Jenkins
```

## Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- See `jenkins/README.md` for more detailed pipeline information

