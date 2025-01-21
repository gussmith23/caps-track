import { readFile } from "fs/promises";

const DEFAULT_CONFIG = "config.json";
// Default values for optional config values.
const DEFAULT_CONFIG_VALUES = {
  port: 3000,
  keyfile: "key.json",
  config: "config.json",
};


export async function getConfig() {
  // If CAPS_TRACK_CONFIG is set, then load the JSON file from that path.
  // Otherwise, load the default config at config/config.json.
  let configPath = process.env.CAPS_TRACK_CONFIG ?? __dirname + "/../config/" + DEFAULT_CONFIG;
  let config = JSON.parse(await readFile(configPath, "utf8"));

  // Set defaults for missing values.
  for (let key in DEFAULT_CONFIG_VALUES) {
    config[key] = config[key] ?? DEFAULT_CONFIG_VALUES[key];
  }

  // Overrides from environment variables.
  if (process.env.CAPS_TRACK_KEYFILE) {
    config["keyfile"] = process.env.CAPS_TRACK_KEYFILE;
  }
  if (process.env.CAPS_TRACK_PORT) {
    config["port"] = parseInt(process.env.CAPS_TRACK_PORT);
  }

  return config;
}

