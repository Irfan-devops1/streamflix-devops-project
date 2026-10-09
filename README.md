# StreamFlix — Netflix-style Clone (Kubernetes-ready)

A portfolio/demo streaming-catalog application with a React UI, Express API, Docker images, Kubernetes manifests, and a Jenkins pipeline. It uses sample metadata and remote poster images; it does **not** include Netflix source code, paid content, or video files.

## Architecture

Browser → Kubernetes NodePort Service → React/Vite-built Nginx frontend  
Frontend → `/api` → Express API Service → sample catalog JSON

## Prerequisites
- Docker
- Kubernetes cluster (Minikube, kind, or a cloud cluster)
- kubectl
- Optional: Jenkins with Docker and kubectl access

## Run locally with Docker Compose
```bash
docker compose up --build
```
Open http://localhost:8080. API health: http://localhost:3000/api/health

## Build images for Kubernetes
Set your Docker Hub username:
```bash
export DOCKERHUB_USER=YOUR_DOCKERHUB_USERNAME
docker build -t $DOCKERHUB_USER/streamflix-api:1.0 ./backend
docker build -t $DOCKERHUB_USER/streamflix-web:1.0 ./frontend
docker push $DOCKERHUB_USER/streamflix-api:1.0
docker push $DOCKERHUB_USER/streamflix-web:1.0
```
Update `k8s/api-deployment.yaml` and `k8s/web-deployment.yaml` image names to match your Docker Hub username.

For Minikube, you can instead build directly into its Docker daemon:
```bash
eval "$(minikube docker-env)"
docker build -t streamflix-api:1.0 ./backend
docker build -t streamflix-web:1.0 ./frontend
```
Then set the image names in the manifests to `streamflix-api:1.0` and `streamflix-web:1.0`, and keep `imagePullPolicy: IfNotPresent`.

## Deploy to Kubernetes
```bash
kubectl apply -f k8s/
kubectl get deployments,pods,svc
minikube service streamflix-web
```
On a cloud cluster, access the frontend using the external address of the `streamflix-web` Service if you change it to `type: LoadBalancer`. The default NodePort is 30080.

## Jenkins
The included `Jenkinsfile` checks out the repository, builds the two Docker images, pushes them to Docker Hub, pushes the scanned images to Docker Hub. Kubernetes deployment is intentionally left for a later phase. Configure Jenkins credentials:
- `dockerhub-credentials`: username/password credential for Docker Hub
- Agent must have Docker CLI/daemon, Node.js/npm, Trivy, and OWASP Dependency-Check configured
- Kubernetes credentials are not needed for this phase
- Set `DOCKERHUB_USER` in the pipeline environment or Jenkins job configuration

Do not expose Docker socket or cluster-admin credentials to untrusted jobs. For production, use a registry service account and least-privilege Kubernetes RBAC.

## Project structure
```text
backend/                 Express API and catalog data
frontend/                React UI and Nginx reverse proxy
k8s/                     Kubernetes Deployments and Services
docker-compose.yml       Local development
Jenkinsfile              CI/CD pipeline
```

## Notes
This is a learning/portfolio starter, not a production streaming platform. It does not implement authentication, DRM, payment, a video CDN, or licensed playback. Use content you own or have permission to display.
