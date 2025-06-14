import { createPostgresDatabaseProvider, PostgresDatabaseService } from '../src/database/postgresDatabase.service';
import { getConfig } from '../src/config';
import { describeDatabaseService } from '../src/database/database.service';
import { Logger } from '@nestjs/common';


let logger = new Logger(__filename);

const config = getConfig();
const provider = createPostgresDatabaseProvider({
  username: config.dbUsername,
  password: config.dbPassword,
  database: config.dbName,
  host: config.dbHostname,
  port: config.dbPort,
});

describeDatabaseService(
  'postgres database',
  provider,
  false,
  () => { },
  () => { },
  (service: PostgresDatabaseService) => {
    service.end();
  },

);

