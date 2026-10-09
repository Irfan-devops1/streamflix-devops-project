# Jenkins security pipeline setup

Install tools on the Jenkins agent that executes the pipeline.

## Jenkins plugins
- Pipeline
- Git
- SonarQube Scanner for Jenkins
- HTML Publisher
- JUnit (usually bundled)

## SonarQube
1. Manage Jenkins → Tools → SonarQube Scanner installations. Add an installation named exactly `SonarScanner`.
2. Manage Jenkins → System → SonarQube servers. Add a server named exactly `SonarQube` and configure its token credential.
3. In SonarQube, configure a webhook to `https://YOUR_JENKINS_URL/sonarqube-webhook/` (keep the trailing slash).
4. Ensure the token can analyze project key `streamflix`.

The Quality Gate stage fails if the gate fails or the webhook is missing. During initial connectivity troubleshooting, you may temporarily disable the Quality Gate stage, but re-enable it before relying on the pipeline.

## OWASP Dependency-Check
Install Dependency-Check CLI on the Jenkins agent. Default path: `/opt/dependency-check/bin/dependency-check.sh`; change `DEPENDENCY_CHECK` in the Jenkinsfile if needed. The first vulnerability database update may take time. Configure an NVD API key securely if required; never commit it to Git. HTML/XML reports are archived in Jenkins.

## Trivy
Install Trivy CLI and ensure it works as the Jenkins service account. The pipeline scans source files for vulnerabilities, misconfigurations, and secrets, then scans both built images. HIGH/CRITICAL findings fail the build because `--exit-code 1` is enabled.

## Docker Hub
Create a Jenkins username/password credential with ID `dockerhub-credentials`; use a Docker Hub access token as the password. Update `DOCKERHUB_USER` in the Jenkinsfile. The Jenkins service account needs access to Docker.

## Kubernetes (not used in this phase)
The current Jenkins pipeline stops after pushing the scanned images to Docker Hub. Kubernetes deployment can be added later; no kubeconfig is required for this phase.

## Agent preflight checks
Run as the Jenkins agent/service account:
```bash
git --version
node --version
npm --version
docker version
kubectl version --client
trivy --version
/opt/dependency-check/bin/dependency-check.sh --version
```

## Important
- Missing security tools are not silently skipped; the pipeline fails so you notice the missing configuration.
- For repeatable builds, generate and commit package lockfiles for both apps, then use `npm ci`.
- This is a portfolio demo, not a production streaming platform.
