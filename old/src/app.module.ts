import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { createPostgresDatabaseProvider } from './database/postgresDatabase.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getConfig } from './config';

let config = getConfig();

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [
    createPostgresDatabaseProvider(
      { username: config.dbUsername, password: config.dbPassword, database: config.dbName, host: config.dbHostname, port: config.dbPort },
    )
  ],
})
export class AppModule { }
