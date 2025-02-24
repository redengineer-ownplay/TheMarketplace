# Web3 Wallet Platform

A full-stack web3 wallet platform that allows users to manage their NFTs on Polygon blockchain. Built with NextJS (frontend) and NestJS (backend).

## Key Features

- Connect wallet with MetaMask
- View NFTs and their metadata 
- Transfer NFTs using username
- Profile management with usernames
- Transaction history tracking
- Automatic NFT metadata caching
- Real-time transaction status updates

## Project Structure

The project uses a monorepo structure with two main workspaces:

```
/
├── architecture/       # This
├── performance/       # The performance simulated for performance trace and lighthouse
├── frontend/           # NextJS frontend application
├── backend/           # NestJS backend API
├── dbschema/         # Database schemas and migrations
└── docker-compose.yml # Redis container config
```

## Quick Start

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend (.env)
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_SCAN_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
```

3. Start development servers:
```bash
# Start all services
npm run start

# Start individual services
npm run start:frontend
npm run start:backend
```

## Architecture Documentation

- [Frontend Architecture](./docs/FRONTEND.md)
- [Backend Architecture](./docs/BACKEND.md) 
- [Infrastructure & DevOps](./docs/INFRASTRUCTURE.md)


## Future Improvements
- [Future Improvement Details](./docs/FUTURE_IMPROVEMENT.md)

## Key Technologies

### Frontend
- Next.js 15 with App Router
- TypeScript
- Zustand for state management
- TailwindCSS for styling
- SWR for data fetching
- React Virtualization (@tanstack/react-virtual)

### Backend
- NestJS 11
- TypeScript
- PostgreSQL (Supabase)
- Redis for caching
- Ethers.js for blockchain interaction

### Infrastructure | Production
- Vercel (Frontend)
- Railway (Backend & Redis Instance)
- Supabase (Database)

## Development Features

- ESLint + Prettier configuration
- TypeScript
- Docker compose for local development

## Security Features

The application implements several security measures:

1. JWT-based authentication with wallet signatures
2. Rate limiting to prevent API abuse
3. HMAC signature verification
4. Data validation and sanitization
5. Secure storage of user information