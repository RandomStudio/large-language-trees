import { BROKER_DEFAULTS, type IClientOptions } from "tether-agent";
import {
  PUBLIC_TETHER_HOST,
  PUBLIC_TETHER_PORT,
  PUBLIC_TETHER_PROTOCOL,
  PUBLIC_TETHER_PATH
} from "$env/static/public";

export const BROWSER_CONNECTION: IClientOptions = {
  ...BROKER_DEFAULTS.browser,
  host: PUBLIC_TETHER_HOST,
  port: parseInt(PUBLIC_TETHER_PORT),
  protocol: PUBLIC_TETHER_PROTOCOL as IClientOptions["protocol"],
  path: PUBLIC_TETHER_PATH
};
