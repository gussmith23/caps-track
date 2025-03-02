import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { sheetProvider } from './sheet.provider';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [sheetProvider],
})
export class AppModule { }
