# Infrastructure & DevOps

Details about deployment architecture and infrastructure setup.

## Architecture Overview

```
                                   ┌─────────────┐
                                   │   Vercel    │
                                   │  (Frontend) │
                                   └─────────────┘
                                          │
                                          ▼
┌─────────────┐                    ┌─────────────┐
│   Supabase  │◄────────────────── │   Railway   │
│(PostgreSQL) │                    │ (Backend)   │
└─────────────┘                    └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   Redis     │
                                   │  (Cache)    │
                                   └─────────────┘
```

## Deployment Setup

### Frontend (Vercel)
- Automatic deployments from main branch
- Environment variables configuration
- Built-in CDN and edge caching
- Automatic SSL certificates

### Backend (Railway)
- Plug and play instances
- Automatic deployment
- Automatic SSL with Let's Encrypt

### Database (Supabase)
- PostgreSQL database
- Row-level security
- Automatic backups
- Connection pooling

## Infrastructure Management

### Database Management
```sql
-- Key tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  username TEXT UNIQUE,
  -- other fields
);

CREATE TABLE nft_metadata (
  contract_address TEXT,
  token_id TEXT,
  metadata JSONB,
  last_updated TIMESTAMPTZ,
  -- other fields
);
```

### Caching Strategy
- Redis for hot data
- NFT metadata caching (24h TTL)
- Request deduplication
- Session management

### Monitoring
- Vercel analytics
- Railway metrics
- Error tracking
- Performance monitoring

## Development Environment

### Local Setup
```bash
# Start Redis
docker-compose up -d

# Development servers
npm run dev
```

### CI/CD Pipeline
- GitHub Actions
- Deployment automation
- Environment promotion