# Web3 Wallet Platform

A secure and user-friendly Web3 wallet platform that enables users to manage and transfer NFTs on the Polygon network with username-based transfers.

## Features

- 🔐 Wallet-based authentication (Through MetaMask)
- 💎 View NFT & token balances
- 🔄 Transfer ERC-721 and ERC-1155 NFTs using usernames
- 👤 User profile management
- ⚡ High-performance & real-time updates
- 📱 Basic Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v22.14.0 or higher)
- npm (v11.1.0 or higher)
- Docker & Docker Compose
- MetaMask browser extension

## Database

If you prefer to use the `./dbschema/index.sql` in your Supabase custom project feel free, although I've pushed the credentials in the .env.example as this is a dummy account for the project. Note in real world scenario, I would never push these credentials in git,svn or any other source control

### In case you prefer to use the SQL schema provided

1. Go to Supabase
2. Login
3. Create Project
4. Go to SQL Editor
5. Copy contents from `./dbschema/index.sql` SQL Schema
6. Run and it

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/red-game-dev/TheMarketplace web3-wallet-platform
cd web3-wallet-platform
```

2. Create environment files (cp .env.example):

For backend (backend/.env):
```env
PORT=4000
CONTRACT_ADDRESS=0xdC0479CC5BbA033B3e7De9F178607150B3AbCe1f
FRONTEND_URL=http://localhost:3000
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_SCAN_API_KEY=your_polygonscan_api_key
PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

For frontend (frontend/.env.local) (cp .env.example)::
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Installation

Install all dependencies for the project:

```bash
# Install root project dependencies and all sub-project dependencies
npm run install:all
```

## Available Commands

### Root Project Commands

```bash
# Start all services (frontend, backend, and Docker containers)
npm run start

# Start individual services
npm run start:frontend    # Start frontend dev server
npm run start:backend     # Start backend dev server
npm run docker:up         # Start Docker containers

# Build the project
npm run build            # Build both frontend and backend
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend

# Run tests
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Linting
npm run lint             # Run linting on all projects
npm run lint:frontend    # Run frontend linting
npm run lint:backend     # Run backend linting

# Formatting
npm run format           # Format all code
npm run format:frontend  # Format frontend code
npm run format:backend   # Format backend code
```

### Frontend-specific Commands (in frontend directory)

```bash
npm run dev         # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linting
```

### Backend-specific Commands (in backend directory)

```bash
npm run start:dev   # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run lint       # Run linting
```

## Architecture

```
project-root/
├── frontend/           # Next.js frontend application
├── backend/           # NestJS backend application
├── dbschema/          # Database schema and migrations
└── docker-compose.yml # Docker configuration
```

## Development Workflow

1. Start the development environment:
```bash
npm run start
```

2. Access the applications:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Deployment

The project is configured for deployment on:
- Frontend: Vercel
- Backend: To be updated (Most likely DigitalOcean)
- Database: Supabase

Follow platform-specific deployment guides for detailed instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.