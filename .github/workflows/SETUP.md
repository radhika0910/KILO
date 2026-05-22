# GitHub Actions Setup Guide

## Workflow Overview

The `main.yaml` workflow includes:

1. **Lint** - Runs ESLint on every push/PR
2. **Build** - Builds Docker images and pushes to GitHub Container Registry (GHCR)
3. **Test** - TypeScript type checking
4. **Security** - Trivy vulnerability scanning
5. **Deploy** - Notifications and deployment hooks

## Initial Setup Steps

### 1. Enable GitHub Container Registry
- Your repo automatically supports GHCR
- No additional setup needed

### 2. Create GitHub Personal Access Token (if needed for private registries)
- Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
- Create token with `write:packages` and `read:packages` scopes
- Add as secret: `REGISTRY_TOKEN`

### 3. Configure Secrets (Optional)

Go to **Settings → Secrets and variables → Actions**

Add these secrets for deployment:

| Secret Name | Purpose | Example |
|---|---|---|
| `DEPLOYMENT_WEBHOOK_URL` | Webhook for triggering deployments | `https://your-deployment-service.com/webhook` |
| `AWS_ACCESS_KEY_ID` | AWS deployment (if using AWS) | Your AWS key |
| `AWS_SECRET_ACCESS_KEY` | AWS deployment | Your AWS secret |
| `DOCKER_USERNAME` | Docker Hub push (if using Docker Hub) | Your Docker username |
| `DOCKER_PASSWORD` | Docker Hub push | Your Docker token |

### 4. Configure Variables (Optional)

Go to **Settings → Secrets and variables → Variables**

| Variable | Purpose | Example |
|---|---|---|
| `DEPLOYMENT_ENV` | Target environment | `production` |
| `REGISTRY_URL` | Alternative registry | `docker.io` |

## Workflow Triggers

The workflow runs automatically on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch  
- ✅ Pull requests to `main` or `develop`

## Docker Images Generated

**Development Image:**
```
ghcr.io/your-username/kilo:main
ghcr.io/your-username/kilo:sha-abc123
ghcr.io/your-username/kilo:latest
```

**Production Image:**
```
ghcr.io/your-username/kilo:prod-abc123
ghcr.io/your-username/kilo:prod-latest
```

## Customization Options

### Deploy to a Service

Uncomment the webhook trigger in `deploy` job and add your deployment URL as `DEPLOYMENT_WEBHOOK_URL` secret:

```yaml
- name: Trigger deployment webhook
  run: |
    curl -X POST ${{ secrets.DEPLOYMENT_WEBHOOK_URL }} \
      -H "Content-Type: application/json" \
      -d '{"image":"${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:prod-${{ github.sha }}"}'
```

### Push to Docker Hub

Replace GHCR login with Docker Hub:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### Deploy to Kubernetes

Add Kubernetes deployment step:

```yaml
- name: Deploy to Kubernetes
  uses: azure/setup-kubectl@v3
  with:
    version: 'v1.28.0'

- name: Update Kubernetes deployment
  run: |
    kubectl set image deployment/weighttracker \
      app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:prod-${{ github.sha }} \
      --namespace=production
```

## Monitoring

- ✅ Check workflow runs: **Actions** tab in GitHub
- ✅ View logs: Click on failed workflow
- ✅ Container images: **Packages** section (right sidebar)
- ✅ Security scans: **Security** tab → **Code scanning**

## Troubleshooting

| Issue | Solution |
|---|---|
| Docker build fails | Check `npm install` in Dockerfile |
| Image push fails | Verify GITHUB_TOKEN has `write:packages` permission |
| Lint fails | Run `npm run lint` locally and fix errors |
| Trivy scan fails | Review security-events in workflow permissions |

## Cost Notes

- GitHub Actions: 2,000 free minutes/month for public repos
- Container Registry: Free storage (12GB limit per organization)
- No charges for running workflows on public repos
