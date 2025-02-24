# Frontend Architecture

The frontend is built with Next.js 15 using the new App Router architecture for improved performance and SEO.

## Directory Structure

```
frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Reusable UI components
│   ├── config/         # Configuration files
│   ├── hooks/          # Custom React hooks
│   ├── providers/      # React context providers
│   ├── services/       # API services
│   ├── store/          # Zustand store
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
```

## Application Structure:

- App Router: For routing and navigation
- Components: Reusable UI components organized by feature
- Services: API client for backend communication
- Hooks: Custom hooks for state management and reusable logic
- Store: Zustand-based global state management

## Key Design Decisions

### State Management
- Uses Zustand with computed selectors for optimal performance
- Structured into slices (NFT, Transaction, User)
- Leverages middleware for devtools and logging

### Data Fetching
- Custom `fetchff` implementation for API calls
- SWR for cache management and real-time updates
- Automatic request deduplication and retries

### Performance Optimizations
- React memo for expensive components
- Virtual scrolling for large lists
- Image optimization with next/image
- Route prefetching
- Tailwind CSS purging

### Component Architecture
- Atomic design principles
- Component composition over inheritance
- Shared UI component library
- Type-safe props with TypeScript

### SEO & Metadata
```typescript
export const metadata = generateMetadata({
  title: 'NFTs | Web3 Wallet Platform',
  description: 'View and manage your NFT collection'
})
```

## Core Features

### Wallet Integration
```typescript
export function WalletProvider({ children }) {
  // MetaMask integration
  // Transaction signing
  // Chain ID validation
}
```

### NFT Management
- NFT Gallery with virtualization
- Metadata caching
- Transfer modal with confirmation
- Transaction status tracking

### Profile System
- Username management
- Transaction history
- Settings interface

## Configuration

### Next.js Optimizations
```typescript
// next.config.ts
export default {
  compress: true,
  experimental: {
    optimizeCss: true
  },
  images: {
    formats: ['image/avif', 'image/webp']
  }
}
```

### Code Quality
- ESLint with Next.js rules
- Prettier formatting
- TypeScript strict mode
- Import sorting