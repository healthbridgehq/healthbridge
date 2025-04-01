# HealthBridge Deployment Guide

## Prerequisites

1. **Accounts Required:**
   - GitHub account
   - AWS account
   - Vercel account
   - Domain name registrar access

2. **Required Tools:**
   - AWS CLI
   - Docker
   - Node.js 18+
   - Python 3.11+
   - Vercel CLI

## Initial Setup

### 1. Environment Variables

Create the following secrets in your GitHub repository:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Application Secrets
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
OPENAI_API_KEY=your_openai_api_key
```

### 2. AWS Infrastructure Setup

1. **Create ECR Repository:**
```bash
aws ecr create-repository --repository-name healthbridge-backend
```

2. **Create ECS Cluster:**
```bash
aws ecs create-cluster --cluster-name healthbridge
```

3. **Create RDS Instance:**
```bash
aws rds create-db-instance \
    --db-instance-identifier healthbridge \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password your_password \
    --allocated-storage 20
```

4. **Create ElastiCache Cluster:**
```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id healthbridge \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1
```

### 3. Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
cd frontend
vercel link
```

4. Deploy to production:
```bash
vercel --prod
```

### 4. Backend Deployment (AWS ECS)

1. Build and push Docker image:
```bash
cd backend
docker build -t healthbridge-backend .
aws ecr get-login-password --region region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
docker tag healthbridge-backend:latest your-account.dkr.ecr.region.amazonaws.com/healthbridge-backend:latest
docker push your-account.dkr.ecr.region.amazonaws.com/healthbridge-backend:latest
```

2. Create ECS task definition and service (use AWS Console or CLI)

### 5. Database Migration

1. Run migrations:
```bash
cd backend
python manage.py migrate
```

## Continuous Deployment

The GitHub Actions workflow will automatically:
1. Run tests
2. Deploy frontend to Vercel
3. Deploy backend to AWS ECS

## Monitoring Setup

1. **AWS CloudWatch:**
   - Set up log groups
   - Create alarms for metrics
   - Configure dashboard

2. **Health Checks:**
   - Configure Route 53 health checks
   - Set up notification alerts

## SSL/TLS Configuration

1. Request SSL certificate through AWS Certificate Manager
2. Configure SSL in load balancer
3. Update DNS records

## Troubleshooting

### Common Issues:

1. **Deployment Failures:**
   - Check GitHub Actions logs
   - Verify AWS credentials
   - Check Vercel deployment logs

2. **Database Connection Issues:**
   - Verify security group settings
   - Check connection string
   - Validate network ACLs

3. **Performance Issues:**
   - Monitor CloudWatch metrics
   - Check ElastiCache hit rate
   - Review ECS service metrics

## Maintenance

### Regular Tasks:

1. **Database:**
   - Monitor disk usage
   - Review slow queries
   - Backup verification

2. **Application:**
   - Log rotation
   - Certificate renewal
   - Dependency updates

3. **Security:**
   - Review IAM permissions
   - Audit security groups
   - Update security patches

## Support

For deployment issues:
1. Check CloudWatch logs
2. Review GitHub Actions workflow
3. Contact DevOps team
