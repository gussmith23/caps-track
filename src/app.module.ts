import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { createGoogleSheetsProvider } from './database/googleSheetsDatabase.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getConfig } from './config';

let config = getConfig();

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [
    createGoogleSheetsProvider(config['keyfile'], config['spreadsheet-id']),
  ],
})
export class AppModule {}
