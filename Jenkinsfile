pipeline {
    agent any

    environment {
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Set Docker registry with default fallback
                    try {
                        env.DOCKER_REGISTRY = credentials('docker-registry-url')
                    } catch (Exception e) {
                        env.DOCKER_REGISTRY = 'localhost:5000'
                    }
                    
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Lint & Code Quality') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Python Lint') {
                    steps {
                        dir('analysis-engine') {
                            sh 'pip install --upgrade pip setuptools wheel || true'
                            sh 'pip install flake8 black || true'
                            sh 'flake8 . --max-line-length=120 --ignore=E501,W503 || true'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test -- --coverage --watchAll=false || true'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm test -- --coverage || true'
                        }
                    }
                }
                stage('Python Tests') {
                    steps {
                        dir('analysis-engine') {
                            sh 'pip install --upgrade pip setuptools wheel'
                            sh 'pip install -r requirements.txt'
                            sh 'pytest --cov=. --cov-report=xml || true'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/identity-manager-frontend:${IMAGE_TAG}")
                                image.push()
                                image.push("latest")
                            }
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/identity-manager-backend:${IMAGE_TAG}")
                                image.push()
                                image.push("latest")
                            }
                        }
                    }
                }
                stage('Build Analysis Engine') {
                    steps {
                        dir('analysis-engine') {
                            script {
                                def image = docker.build("${DOCKER_REGISTRY}/identity-manager-analysis:${IMAGE_TAG}")
                                image.push()
                                image.push("latest")
                            }
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL \
                        ${DOCKER_REGISTRY}/identity-manager-frontend:${IMAGE_TAG} || true
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down
                        docker-compose -f ${DOCKER_COMPOSE_FILE} pull
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down
                        docker-compose -f ${DOCKER_COMPOSE_FILE} pull
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

