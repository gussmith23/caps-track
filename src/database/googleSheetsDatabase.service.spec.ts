import { getConfig } from '../config';
import { describeDatabaseService } from './database.service';
import { createGoogleSheetsProvider } from './googleSheetsDatabase.service';
import { Logger } from '@nestjs/common';

// Get the config.
let config = getConfig();

let logger = new Logger('GoogleSheetsDatabaseService');

if (config['testing-keyfile']) {
  logger.log('testing-keyfile is set, running tests using the testing user');

  if (!config['testing-spreadsheet-id']) {
    throw new Error('testing-spreadsheet-id is not set');
  }

  describeDatabaseService(
    'google sheets test database',
    createGoogleSheetsProvider(
      config['testing-keyfile'],
      config['testing-spreadsheet-id'],
    ),
  );

  // TODO(@gussmith23): CRITICAL DO NOT MERGE: this currently *could* write values
  // to the prod database. We should make the credentials an argument here.
  describeDatabaseService(
    'google sheets read-only tests on prod database with test user',
    createGoogleSheetsProvider(
      config['testing-keyfile'],
      config['spreadsheet-id'],
      true,
    ),
    true,
  );
}
