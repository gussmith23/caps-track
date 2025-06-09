import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { engine } from 'express-handlebars';
import { formatDate, formatPlayer, itemToHtml, mapLookup } from '../hbs_helpers/helpers';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

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
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
