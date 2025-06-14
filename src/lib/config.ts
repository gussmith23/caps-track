// Central source for configuration management.

import { config } from 'dotenv';
import { logger } from "@/lib/logger";

// Load environment variables from .env file
config({ path: process.env.CAPS_TRACK_ENV_FILE || '.env' });

const log = logger.child({ module: "config" });

// Define config type
export type Config = {
  dbHostname: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbName: string;
  port: number;
};

let parsedConfig = new Map<string, any>();

// Port configuration.
if (!process.env.CAPS_TRACK_PORT) {
  throw new Error(
    'Port configuration is incomplete. Please provide CAPS_TRACK_PORT as an environment variable.'
  );
}
parsedConfig.set("port", parseInt(process.env.CAPS_TRACK_PORT));

// Database configuration.
if (!process.env.CAPS_TRACK_DB_HOSTNAME ||
  !process.env.CAPS_TRACK_DB_PORT ||
  !process.env.CAPS_TRACK_DB_USERNAME ||
  !process.env.CAPS_TRACK_DB_PASSWORD ||
  !process.env.CAPS_TRACK_DB_NAME) {
  throw new Error(
    'Database configuration is incomplete. Please provide as environment variables.'
  );
}
parsedConfig.set('dbHostname', process.env.CAPS_TRACK_DB_HOSTNAME);
// Convert to number if it's a string
const port = parseInt(process.env.CAPS_TRACK_DB_PORT);
if (isNaN(port)) {
  const errorStr = `Invalid database port: ${process.env.CAPS_TRACK_DB_PORT}`;
  log.error(errorStr);
  throw new Error(errorStr);
}
parsedConfig.set('dbPort', port);
parsedConfig.set('dbUsername', process.env.CAPS_TRACK_DB_USERNAME);
parsedConfig.set('dbPassword', process.env.CAPS_TRACK_DB_PASSWORD);
parsedConfig.set('dbName', process.env.CAPS_TRACK_DB_NAME);


const out = {
  dbHostname: parsedConfig.get('dbHostname'),
  dbPort: parsedConfig.get('dbPort'),
  dbUsername: parsedConfig.get('dbUsername'),
  dbPassword: parsedConfig.get('dbPassword'),
  dbName: parsedConfig.get('dbName'),
  port: parsedConfig.get('port')
} as Config;


log.debug(`Configuration loaded:\n ${JSON.stringify(out)}`);

export default out;
