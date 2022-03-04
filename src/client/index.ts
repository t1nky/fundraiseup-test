import { PingClient } from "./PingClient";

console.log("Starting client");

const client = new PingClient(
  "https://fundraiseup.com/",
  "http://127.0.0.1:8080"
);
client.start();

const shutdown = () => {
  client.stop();

  console.log(
    `Client stopped\n` +
      `  Total requests: ${client.stats.total}\n` +
      `  Timed out: ${client.stats.timeout}\n` +
      `  Internal server error (500): ${client.stats.error500}\n` +
      `  Success: ${client.stats.success}`
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
