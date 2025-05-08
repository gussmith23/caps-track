import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import {
  formatDate,
  formatPlayer,
  itemToHtml,
  mapLookup,
} from 'hbs_helpers/helpers';
import { engine } from 'express-handlebars';
import { getConfig } from './config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const logger = new Logger('Main');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine(
    '.hbs',
    engine({
      extname: '.hbs',
      helpers: { formatPlayer, mapLookup, formatDate, itemToHtml },
      defaultLayout: 'default',
    }),
  );
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  const config = await getConfig();
  logger.log('Starting server on port ' + config.port);
  await app.listen(config.port);
}
bootstrap();
