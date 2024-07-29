/**
 * Interface for "displaysNotifyServer" messages.
 *
 * We cannot reliably publish messages from the display clients
 * back to the server via Tether/MQTT/HiveMQ.
 * Since there is no "server" listening constantly (Netlify is
 * serverless), we use a POST to the API instead.
 *
 * These messages are always published by the **display clients** and
 * received by the **server**. These messages inform the server
 * that either
 * - a display has come online (it might have been restarted)
 * and therefore requires new content
 * - a display has reached the timeout given for a specific type of
 * content and requires new content
 */
export interface DisplayNotifyServer {
  event: "init" | "timeout";
  displayId: string;
}
