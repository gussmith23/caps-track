import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { sheetProvider } from './database/googleSheetsDatabase.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [sheetProvider],
})
export class AppModule {}
