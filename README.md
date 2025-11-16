# Profile Management and Data Analysis System

A comprehensive enterprise-grade solution for profile management and data analysis.

## Features

- User Profile Management
- Role-based Access Control
- Data Analysis Dashboard
- Real-time Analytics
- Data Visualization
- Report Generation
- API Integration
- Secure Authentication
- Audit Logging

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT
- Data Analysis: Python with Pandas, NumPy
- Visualization: D3.js, Chart.js
- Testing: Jest, Pytest
- Containerization: Docker
- CI/CD: Jenkins

## Project Structure

```
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend server
├── analysis-engine/         # Python data analysis service
├── docs/                    # Documentation
└── docker/                  # Docker configuration files
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL (v14 or higher)
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install

   # Analysis Engine
   cd analysis-engine
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development servers:
   ```bash
   # Using Docker
   docker-compose up

   # Or individually
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   npm run dev

   # Analysis Engine
   cd analysis-engine
   python main.py
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend API runs on: http://localhost:8000
- Analysis Engine runs on: http://localhost:5000

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Analysis Engine tests
cd analysis-engine
pytest
```

## DevOps & CI/CD

This project uses Jenkins for continuous integration and deployment, along with Docker for containerization.

### Docker Setup

#### Development Environment

```bash
# Start all services in development mode
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

#### Production Environment

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

### Jenkins CI/CD Setup

#### Quick Start

1. **Start Jenkins**:
   ```bash
   docker-compose -f docker-compose.jenkins.yml up -d
   ```

2. **Access Jenkins**:
   - Open `http://localhost:8080`
   - Get initial password:
     ```bash
     docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
     ```

3. **Configure Pipeline**:
   - Create a new Pipeline job
   - Point to your Git repository
   - Use the `Jenkinsfile` in the root directory

**Note**: If you already have Jenkins installed, see [JENKINS_EXISTING_SETUP.md](JENKINS_EXISTING_SETUP.md) for configuration instructions.

For detailed Jenkins setup instructions, see [jenkins/README.md](jenkins/README.md).

#### Pipeline Stages

The Jenkins pipeline includes:

1. **Checkout**: Repository cloning
2. **Lint & Code Quality**: Code linting for all services
3. **Test**: Unit tests execution
4. **Build Docker Images**: Docker image building and tagging
5. **Security Scan**: Vulnerability scanning
6. **Deploy**: Automatic deployment to staging/production

#### Branch Strategy

- `main` branch → Production deployment
- `develop` branch → Staging deployment
- Other branches → Build and test only

### Docker Images

Each service has its own Dockerfile:

- **Frontend**: `frontend/Dockerfile` (dev) and `frontend/Dockerfile.prod` (production)
- **Backend**: `backend/Dockerfile` (dev) and `backend/Dockerfile.prod` (production)
- **Analysis Engine**: `analysis-engine/Dockerfile` (dev) and `analysis-engine/Dockerfile.prod` (production)

### Building Individual Services

```bash
# Frontend
cd frontend
docker build -t identity-manager-frontend:latest -f Dockerfile.prod .

# Backend
cd backend
docker build -t identity-manager-backend:latest -f Dockerfile.prod .

# Analysis Engine
cd analysis-engine
docker build -t identity-manager-analysis:latest -f Dockerfile.prod .
```

### Environment Variables

Create `.env` files for each environment:

- Development: Use `docker-compose.yml` environment variables
- Production: Update `docker-compose.prod.yml` with production values

Required variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `REACT_APP_API_URL`, `REACT_APP_ANALYSIS_URL`

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 