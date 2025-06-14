import { Logger } from '@nestjs/common';


const logger = new Logger(__filename);

// Define config type
export type Config = {
  dbHostname: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbName: string;
  port: number;
};

export function getConfig(): Config {
  let config = {};

  // Port configuration.
  if (!process.env.CAPS_TRACK_PORT) {
    throw new Error(
      'Port configuration is incomplete. Please provide CAPS_TRACK_PORT as an environment variable.'
    );
  }
  config['port'] = parseInt(process.env.CAPS_TRACK_PORT);

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
  config['dbHostname'] = process.env.CAPS_TRACK_DB_HOSTNAME;
  // Convert to number if it's a string
  const port = parseInt(process.env.CAPS_TRACK_DB_PORT);
  if (isNaN(port)) {
    const errorStr = `Invalid database port: ${process.env.CAPS_TRACK_DB_PORT}`;
    logger.error(errorStr);
    throw new Error(errorStr);
  }
  config['dbPort'] = port;
  config['dbUsername'] = process.env.CAPS_TRACK_DB_USERNAME;
  config['dbPassword'] = process.env.CAPS_TRACK_DB_PASSWORD;
  config['dbName'] = process.env.CAPS_TRACK_DB_NAME;

  return {
    dbHostname: config['dbHostname'],
    dbPort: config['dbPort'],
    dbUsername: config['dbUsername'],
    dbPassword: config['dbPassword'],
    dbName: config['dbName'],
    port: config['port'],
  };
}
