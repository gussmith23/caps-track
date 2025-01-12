import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { sheetProvider } from './sheet.provider';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, sheetProvider],
})
export class AppModule { }
