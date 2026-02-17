import { Injectable } from '@nestjs/common';

@Injectable()             //@Injectable → “bu klassni boshqa joyda ishlatish mumkin” degani.
export class AppService {
  getHello(): string {
    return 'Welcome to Nestar Rest API Server!';
  }
}
