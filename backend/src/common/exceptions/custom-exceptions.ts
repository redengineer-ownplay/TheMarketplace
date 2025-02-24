import { HttpException, HttpStatus } from '@nestjs/common';

export class NFTTransferException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        error: 'NFT Transfer Failed',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class WalletAuthenticationException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Authentication Failed',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(
      {
        message: `User not found with identifier: ${identifier}`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
