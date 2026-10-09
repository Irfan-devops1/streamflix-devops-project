pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    DOCKERHUB_USER = 'YOUR_DOCKERHUB_USERNAME'
    IMAGE_TAG = "${BUILD_NUMBER}"
    API_IMAGE = "${DOCKERHUB_USER}/streamflix-api:${IMAGE_TAG}"
    WEB_IMAGE = "${DOCKERHUB_USER}/streamflix-web:${IMAGE_TAG}"
    SONAR_SERVER = 'SonarQube'
    DEPENDENCY_CHECK = '/opt/dependency-check/bin/dependency-check.sh'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Validate project') {
      steps {
        sh '''
          set -eu
          test -f frontend/package.json
          test -f backend/package.json
          node --version
          npm --version
        '''
      }
    }

    stage('Install dependencies and build frontend') {
      steps {
        sh '''
          set -eu
          cd frontend
          npm install
          npm run build
          cd ../backend
          npm install --omit=dev
        '''
      }
    }

    stage('SonarQube analysis') {
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          withSonarQubeEnv("${SONAR_SERVER}") {
            sh("${scannerHome}/bin/sonar-scanner -Dsonar.projectBaseDir='${WORKSPACE}' -Dsonar.projectKey=streamflix -Dsonar.projectName=StreamFlix -Dsonar.sources=frontend/src,backend -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** -Dsonar.sourceEncoding=UTF-8")
          }
        }
      }
    }

    stage('SonarQube Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('OWASP Dependency-Check') {
      steps {
        sh '''
          set -eu
          mkdir -p reports/dependency-check
          if [ ! -x "$DEPENDENCY_CHECK" ]; then
            echo "OWASP Dependency-Check CLI not found at $DEPENDENCY_CHECK"
            exit 2
          fi
          "$DEPENDENCY_CHECK" --project "StreamFlix" \
            --scan "$WORKSPACE/frontend" --scan "$WORKSPACE/backend" \
            --format "HTML" --format "XML" --failOnCVSS 7 \
            --out "$WORKSPACE/reports/dependency-check"
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/dependency-check/**', allowEmptyArchive: true
          publishHTML(target: [
            allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true,
            reportDir: 'reports/dependency-check',
            reportFiles: 'dependency-check-report.html',
            reportName: 'OWASP Dependency-Check'
          ])
        }
      }
    }

    stage('Trivy filesystem scan') {
      steps {
        sh '''
          set -eu
          mkdir -p reports/trivy
          trivy fs --scanners vuln,misconfig,secret --severity HIGH,CRITICAL \
            --exit-code 1 --format table --output reports/trivy/fs-report.txt .
          trivy fs --scanners vuln,misconfig,secret --format json \
            --output reports/trivy/fs-report.json .
        '''
      }
      post {
        always { archiveArtifacts artifacts: 'reports/trivy/**', allowEmptyArchive: true }
      }
    }

    stage('Docker build') {
      steps {
        sh '''
          set -eu
          docker build --pull -t "$API_IMAGE" ./backend
          docker build --pull -t "$WEB_IMAGE" ./frontend
        '''
      }
    }

    stage('Trivy image scan') {
      steps {
        sh '''
          set -eu
          mkdir -p reports/trivy
          trivy image --severity HIGH,CRITICAL --exit-code 1 \
            --format table --output reports/trivy/api-image-report.txt "$API_IMAGE"
          trivy image --severity HIGH,CRITICAL --exit-code 1 \
            --format table --output reports/trivy/web-image-report.txt "$WEB_IMAGE"
        '''
      }
      post {
        always { archiveArtifacts artifacts: 'reports/trivy/**', allowEmptyArchive: true }
      }
    }

    stage('Docker Hub push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
          usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASSWORD')]) {
          sh '''
            set -eu
            echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USER" --password-stdin
            docker push "$API_IMAGE"
            docker push "$WEB_IMAGE"
            docker logout
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
      sh 'docker image prune -f || true'
    }
    success {
      echo 'CI/CD completed: quality/security checks passed and images pushed to Docker Hub. Kubernetes deployment is not included in this pipeline yet.'
    }
    failure {
      echo 'Pipeline failed. Review the first failed stage and archived reports.'
    }
  }
}
