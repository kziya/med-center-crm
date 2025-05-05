import { BadRequestException } from '@nestjs/common';

export class EmailOrPasswordWrongException extends BadRequestException {
  constructor() {
    super('Email or password is incorrect.');
  }
}
