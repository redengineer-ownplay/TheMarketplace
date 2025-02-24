# Backend Architecture

NestJS-based backend providing API endpoints for NFT management and user authentication.

## Configuration

### Server Setup
```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.use(helmet());
app.use(compression());
app.useGlobalPipes(new ValidationPipe());
```

### Environment Variables
Required variables:
- `POLYGON_RPC_URL`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `REDIS_URL`

### NFT Handling
```typescript
@Injectable()
export class NFTMetadataService {
  // 24h cache duration
  private CACHE_DURATION = 24 * 60 * 60 * 1000;
  
  async getMetadata(contractAddress: string, tokenId: string) {
    // Check cache
    // Fetch from chain if needed
    // Store in database
  }
}
```

## Directory Structure

```
backend/
├── src/
│   ├── common/         # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── factories/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── core/          # Core modules
│   │   ├── auth/
│   │   ├── cache/
│   │   └── database/
│   │   ├── rate-limit/
│   │   ├── shared/
│   ├── features/      # Feature modules
│   │   ├── nft/
│   │   ├── transaction/
│   │   └── user/
│   └── utils/         # Utility functions
```

## Key Design Decisions

### Database Design

![Database Schema](../../dbschema/image.png)

Tables:
- users: Stores wallet addresses and usernames
- nft_metadata: Caches NFT metadata
- transactions: Records transfer history

### API Architecture
- RESTful endpoints
- Request validation with class-validator
- Response transformation
- Error handling with filters
- Rate limiting

### Authentication
- JWT-based auth
- Wallet signature verification
- Guard-based route protection

### Performance
- Redis caching
- Response compression
- Request deduplication
- Connection pooling

## API Modules

### NFT Module
- Get user NFTs
- Transfer NFTs
- Metadata caching
- Transaction tracking

### User Module  
- Wallet authentication
- Profile management
- Username registration

### Transaction Module
- Transfer history
- Status updates
- Event tracking

## Common Components
- Guards: Authentication and rate limiting guards
- Interceptors: Response transformation and error handling
- Pipes: Data validation and transformation
- Decorators: Custom decorators for rate limiting and user extraction

## Rate Limiting Implementation

Rate limiting is implemented to protect the API from abuse and ensure fair usage of resources.

### Key Rate Limiting Components

1. **RateLimitModule**:
   - Centralizes rate limiting configuration
   - Provides factory for creating rate limiters
   - Manages rate limiting service

2. **RateLimitFactory**:
   - Creates rate limiters with custom configurations for different endpoints
   - Utilizes Redis for distributed rate limiting across multiple server instances

3. **RateLimitService**:
   - Initializes default rate limiters for different endpoint categories
   - Provides access to rate limiters throughout the application

4. **RateLimitGuard**:
   - Guards routes against excessive requests
   - Uses RateLimiterRedis for efficient rate tracking

5. **RateLimit Decorator**:
   - Configures rate limiting parameters per endpoint
   - Allows for fine-grained control over limits

### Rate Limiting Strategy

The rate limiting strategy varies by endpoint type to balance security and usability:

1. **Authentication Endpoints**:
   - Stricter limits (10 requests per minute)
   - Prevents brute force attacks

2. **NFT Transfer Endpoints**:
   - Very strict limits (5 requests per minute)
   - Protects blockchain interactions
   - Prevents spam transfers

3. **Read-Only Endpoints**:
   - More lenient limits (30-60 requests per minute)
   - Allows for reasonable usage patterns

4. **User Profile Endpoints**:
   - Moderate limits (30 requests per minute)
   - Balances security and usability

### Implementation Details

1. **Redis-Based Storage**:
   - Uses Redis for tracking request counts
   - Enables distributed rate limiting across multiple server instances
   - Automatically expires records to prevent memory leaks

2. **Key Generation**:
   - Uses a combination of IP address and user ID (when available)
   - Provides protection against both authenticated and unauthenticated abuse

3. **Customizable Configuration**:
   - Rate limits can be adjusted through environment variables
   - Different limits for different endpoint types
   - Per-route configuration through decorators

4. **Error Handling**:
   - Custom exception for rate limit errors (HTTP 429)
   - Clear error messages for exceeded limits
   - Proper retry-after headers

## Security Considerations

The application implements several security measures beyond rate limiting:

1. **Authentication**:
   - Wallet-based authentication using cryptographic signatures
   - JWT tokens for session management
   - Token validation and verification

2. **Data Validation**:
   - Input validation using class-validator