# DevOps Guide — End-to-End Automation Plan

Purpose
- Provide a single, step-by-step guide that takes a developer with this repo from local development to an automated cloud deployment pipeline (CI/CD) and production-like platform.
- Emphasizes practical commands, minimal-cost demo options, and checkpoints for learning and verification.

Audience
- Developers who are new to DevOps and want a structured path.

Prerequisites
- Basic git, Node.js, Docker, and a text editor.
- An AWS account (free-tier recommended) and AWS CLI configured locally.
- Terraform, kubectl, helm, docker, and a CI runner (GitHub Actions or Jenkins) installed locally or accessible.

Overview of Concepts (short)
- Infrastructure as Code (IaC): Terraform to declare cloud resources.
- Containerization: Dockerfiles for services; Docker Compose for local integration.
- Orchestration: Kubernetes (EKS) or single EC2 host for demo; use Helm charts for deployment templates.
- CI: Automated build/test/scan pipelines (GitHub Actions or Jenkins).
- CD: Automated deploy of container images to cluster using Helm.
- Observability: Prometheus/Grafana for metrics, Fluent Bit + OpenSearch/Kibana for logs.
- Messaging: SQS or RabbitMQ for demo; MSK in production.
- Secrets: AWS Secrets Manager + ExternalSecrets for k8s.

Roadmap (phases)

Phase 0 — Project hygiene (1 day)
- Standardize repo layout: `frontend/`, `backend/`, `infra/`, `deploy/`, `docs/`.
- Add `CONTRIBUTING.md` and `README.md` with local run instructions.
- Add `.gitignore`, pre-commit hooks (husky for JS), and branch strategy notes (main/dev/feature).

Phase 1 — Containerize & local integration (1–2 days)
Goals: reproducible development and local integration tests.
Actions:
- Add `Dockerfile` for `backend/` and `frontend/`.
- Add `docker-compose.dev.yml` to run Postgres, backend, frontend, and any other services.
Example Docker build commands:
```bash
# backend
docker build -t heavenly-bakes-backend:dev ./backend
# frontend
docker build -t heavenly-bakes-frontend:dev ./frontend
# compose up
docker-compose -f docker-compose.dev.yml up --build
```
Checkpoints:
- App runs locally via compose; DB migrations succeed; frontend connects to backend.

Phase 2 — Tests & code quality (2–4 days)
Goals: test coverage and static checks before CI runs.
Actions:
- Add unit tests for services, `npm test` scripts.
- Add ESLint + Prettier and CI-enforced rules.
- Add a basic SonarQube config (optional SonarCloud for hosted).

Phase 3 — CI pipeline (2–3 days)
Goals: automated lint/test/build and artifact creation.
Choices: GitHub Actions (recommended starter) or Jenkins (self-hosted).
Actions:
- Create `.github/workflows/ci.yml` or `Jenkinsfile`.
- Steps: checkout → install deps → lint → tests → build → docker build → trivy scan → push image to registry (Docker Hub or ECR).
Example GitHub Actions minimal step to build and push to Docker Hub:
```yaml
# .github/workflows/ci.yml (excerpt)
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build backend image
        run: |
          docker build -t ${{ secrets.DOCKER_USER }}/heavenly-backend:${{ github.sha }} ./backend
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USER }}
          password: ${{ secrets.DOCKER_PASS }}
      - name: Push
        run: |
          docker push ${{ secrets.DOCKER_USER }}/heavenly-backend:${{ github.sha }}
```
Checkpoints:
- CI status shown in PRs; images pushed to registry.

Phase 4 — Infra as Code (IaC) with Terraform (2–4 days)
Goals: reproducible cloud infra provisioning.
Actions and modules to create in `infra/terraform/`:
- `network` — VPC, subnets (public/private), NAT, IGW
- `ecr` — repositories for services
- `rds` — Postgres (free-tier: db.t3.micro or db.t2.micro for 12 months)
- `s3-backend` — S3 bucket + DynamoDB table for remote state locking
- `eks` or `ec2` — EKS cluster or single EC2 host (choose EC2 for cheapest demo)
Workflow:
```bash
cd infra/terraform
terraform init
terraform plan -out plan.tfplan
terraform apply plan.tfplan
```
Cost-aware advice:
- For learning, prefer: EC2 single host + Docker Compose OR small EKS with 1 t3.small node and tear down when idle.

Phase 5 — Kubernetes manifests / Helm (2–4 days)
Goals: deploy images to cluster using parameterized Helm charts.
Actions:
- Create `deploy/helm/bakery` chart with templates for `deployment`, `service`, `ingress`, `values.yaml`.
- Configure `ConfigMap` and `Secret` references; use `external-secrets` to pull from AWS Secrets Manager.
Deploy example:
```bash
helm upgrade --install bakery deploy/helm/bakery -n bakery --create-namespace \
  --set image.repository=<repo> --set image.tag=<tag>
```

Phase 6 — CD pipeline integration (1–2 days)
Goals: automate deploy after successful CI build.
Actions:
- Add a CD job to CI that runs `helm upgrade` using a service account kubeconfig (stored in CI secret manager).
- Use image tags by commit SHA to enable immutable deployments.

Phase 7 — Observability + Logging (2–3 days)
Goals: monitor health, metrics, and logs.
Actions:
- Install `kube-prometheus-stack` via Helm for Prometheus + Grafana.
- Install Fluent Bit to forward logs to OpenSearch/Kibana or an S3 sink.
- Add example Grafana dashboards and Alertmanager rules.

Phase 8 — Security, policies, and production hardening (ongoing)
- Add Trivy vulnerability scanning; enforce quality gates.
- Enable AWS IAM roles for service accounts (IRSA) for secure AWS access from pods.
- Implement network policies, RBAC, and pod security policies.

Phase 9 — Automation, runbooks, and cost control
- Add Terraform `destroy` or automation to tear down dev infra after tests.
- Set AWS Budgets and alerts; create runbooks for incidents and rollback.

Appendix — Starter templates and snippets
- `Dockerfile` (backend simple example)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node","src/server.js"]
```
- `docker-compose.dev.yml` (skeleton)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: heavenly
    volumes:
      - db-data:/var/lib/postgresql/data
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/heavenly
    depends_on: [db]
  frontend:
    build: ./frontend
    environment:
      API_URL: http://localhost:3000/api
    depends_on: [backend]
volumes:
  db-data:
```

Learning resources (short)
- Terraform official docs: https://learn.hashicorp.com/terraform
- Kubernetes basics: https://kubernetes.io/docs/tutorials/
- Helm: https://helm.sh/docs/
- GitHub Actions: https://docs.github.com/actions
- Docker Compose: https://docs.docker.com/compose/

Estimated timeline (solo developer)
- Minimal demo (compose + CI push to Docker Hub): 1–2 weeks
- Full infra + EKS + CD + monitoring: 3–6 weeks

Checkpoints and validation
- Local compose runs; unit tests passing
- CI green on PR and images pushed
- Terraform apply success for dev infra
- Helm deploy success and app reachable
- Prometheus/Grafana present and collecting metrics

Next steps I can do now (choose one)
- Scaffold `infra/terraform/` skeleton with S3 backend + simple EC2 module for demo.
- Add `Dockerfile`s and `docker-compose.dev.yml` to repo and validate locally.
- Create a GitHub Actions `ci.yml` that builds, tests, scans, and pushes images to Docker Hub.

---

File created by the assistant to help plan and implement your end-to-end DevOps automation. Update the choices at the end to tell me which I should scaffold first.
