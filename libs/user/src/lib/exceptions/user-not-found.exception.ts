import { BadRequestException } from '@nestjs/common';

export class UserNotFoundException extends BadRequestException {
  constructor() {
    super('USER_NOT_FOUND');
  }
}
