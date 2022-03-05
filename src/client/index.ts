import { PingClient } from "./PingClient";

console.log("Starting client");

const client = new PingClient(
  process.env.PING_URL || "https://fundraiseup.com/",
  process.env.REPORT_URL || "http://127.0.0.1:8080/data"
);
client.start();

const shutdown = () => {
  client.stop();

  console.log(
    `Client stopped\n` +
      `  Total requests: ${client.stats.total}\n` +
      `  Success: ${client.stats.success}\n` +
      `  Internal server error (500): ${client.stats.error500}\n` +
      `  Timed out: ${client.stats.timeout}`
  );
};

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received.");
  shutdown();
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received.");
  shutdown();
});
