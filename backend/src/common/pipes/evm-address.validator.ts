import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ethers } from 'ethers';

@Injectable()
export class ParseEVMAddressValidator implements PipeTransform<string, string> {
  /**
   * Validates and transforms an EVM-compatible address (Ethereum, Polygon, etc.)
   * @param value The address to validate
   * @returns The checksummed address
   * @throws BadRequestException if the address is invalid
   */
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Wallet address is required');
    }

    try {
      const cleanAddress = value.toLowerCase().replace('0x', '');
      if (cleanAddress.length !== 40) {
        throw new Error('Invalid address length');
      }

      if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) {
        throw new Error('Invalid characters in address');
      }
      const checksumAddress = ethers.utils.getAddress(value);

      if (checksumAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Zero address not allowed');
      }

      return checksumAddress;
    } catch {
      throw new BadRequestException({
        message: 'Invalid wallet address',
        error: 'Validation Failed',
        details: {
          constraints: {
            isEVMAddress: 'Must be a valid EVM address (Ethereum, Polygon, etc.)',
          },
          value,
        },
      });
    }
  }
}

@ValidatorConstraint({ name: 'isEVMAddress', async: false })
export class IsEVMAddressConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    try {
      if (!value) return false;
      const cleanAddress = value.toLowerCase().replace('0x', '');
      if (cleanAddress.length !== 40) return false;
      if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) return false;
      ethers.utils.getAddress(value);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'Must be a valid EVM address (Ethereum, Polygon, etc.)';
  }
}

export function IsEVMAddress(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEVMAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEVMAddressConstraint,
    });
  };
}
