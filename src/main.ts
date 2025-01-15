import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { formatPlayer } from 'hbs_helpers/player_helpers';
import { create, engine } from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('.hbs', engine({ extname: '.hbs', helpers: { formatPlayer }, layoutsDir: join(__dirname, '..', 'views'), defaultLayout: '' }));
  app.setViewEngine('hbs');
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
