# Docker Deployment Guide - Auto-Insight Engine (AIE)

## Prerequisites

1. **Docker & Docker Compose** installed on your system
2. **Database** (PostgreSQL) - either external or using Docker
3. **API Keys** for your chosen LLM provider(s)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Add API keys for the LLM providers you want to use
- Set `LLM_PROVIDER` to your preferred default provider

### 2. Build and Run

Using Docker Compose (recommended):

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

Using Docker directly:

```bash
# Build the image
docker build -t aie-app .

# Run the container
docker run -d \
  --name aie-app \
  -p 5000:5000 \
  --env-file .env \
  aie-app
```

### 3. Access the Application

- Application: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `LLM_PROVIDER` | Default LLM provider | No | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | Conditional* | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | Conditional* | - |
| `GEMINI_API_KEY` | Google Gemini API key | Conditional* | - |
| `DEEPSEEK_API_KEY` | DeepSeek API key | Conditional* | - |
| `XAI_API_KEY` | xAI (Grok) API key | Conditional* | - |
| `NODE_ENV` | Node environment | No | `production` |
| `PORT` | Application port | No | `5000` |

*At least one LLM provider API key is required.

### LLM Provider Options

- `openai` - OpenAI GPT-4o (범용성)
- `anthropic` - Claude 3.5 Sonnet (분석력)
- `gemini` - Google Gemini 1.5 Pro (속도)
- `deepseek` - DeepSeek-V2 (추론력)
- `grok` - xAI Grok (실시간성)

## Production Deployment

### Security Considerations

1. **Use Docker secrets** for sensitive environment variables
2. **Set up reverse proxy** (Nginx/Traefik) with SSL/TLS
3. **Configure firewall** to restrict access
4. **Regular security updates** for base images

### Performance Optimization

1. **Resource Limits**: Set appropriate CPU/memory limits
2. **Database Connection Pooling**: Configure based on your load
3. **Load Balancing**: Use multiple container instances if needed

### Monitoring & Logging

```bash
# Monitor container health
docker-compose ps

# View application logs
docker-compose logs -f app

# Check resource usage
docker stats aie-app
```

### Health Checks

The application includes built-in health checks:
- Endpoint: `GET /api/health`
- Docker health check configured with 30s intervals
- Returns service status and timestamp

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from container
   - Check firewall rules

2. **API Key Errors**
   - Verify API keys are valid and active
   - Check quota/billing status for LLM providers
   - Ensure environment variables are properly set

3. **Build Failures**
   - Clear Docker cache: `docker system prune -a`
   - Check disk space availability
   - Verify all source files are present

### Logs and Debugging

```bash
# Detailed container logs
docker-compose logs --tail=100 -f app

# Execute commands in running container
docker-compose exec app sh

# Check environment variables
docker-compose exec app printenv
```

## Backup and Recovery

### Database Backup

```bash
# Create database backup
docker-compose exec postgres pg_dump -U username database_name > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U username database_name < backup.sql
```

### Application Data

- Configuration files: `.env`, `docker-compose.yml`
- Generated content stored in database
- No persistent file storage required

## Scaling

For high-traffic scenarios:

1. **Horizontal Scaling**: Run multiple container instances
2. **Load Balancer**: Use Nginx or cloud load balancer
3. **Database Scaling**: Consider read replicas or connection pooling
4. **Caching**: Implement Redis for session/API response caching

```yaml
# Example: Multiple app instances
services:
  app:
    # ... existing config
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Validate API key permissions