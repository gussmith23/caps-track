import { Test } from '@nestjs/testing';
import { getConfig } from '../config';
import { DatabaseService } from './database.service';
import { FakeDatabaseService } from './fakeDatabase.service';
import { Point } from '../point';
import {
  prodGoogleSheetsProvider,
  testGoogleSheetsProvider,
} from './googleSheetsDatabase.service';
import { Provider } from '@nestjs/common';
import { describeDatabaseService } from './database.service.spec';

// Get the config.
let config = getConfig();

if (config['testing-keyfile'] && config['testing-spreadsheet-id']) {
  describeDatabaseService(
    'google sheets test database',
    testGoogleSheetsProvider,
  );
}

// TODO(@gussmith23): CRITICAL DO NOT MERGE: this currently *could* write values
// to the prod database. We should make the credentials an argument here.
describeDatabaseService(
  'google sheets prod database',
  prodGoogleSheetsProvider,
  true,
);
