import { BROKER_DEFAULTS, type IClientOptions } from "tether-agent";

export const BROWSER_CONNECTION: IClientOptions = {
  ...BROKER_DEFAULTS.browser,
  host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
  port: 8884,
  protocol: "wss",
  path: "/mqtt"
};
