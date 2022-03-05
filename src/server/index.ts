import http from "http";
import { average, median } from "./helpers";

const responseTimes: number[] = [];

const requestListener: http.RequestListener = function (req, res) {
  if (req.method === "POST" && req.url === "/data") {
    let body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      const responseChance = Math.random();
      if (responseChance < 0.6) {
        console.log(
          `${new Date()} ${req.socket.remoteAddress}:${req.socket.remotePort} ${
            req.method
          } ${req.url} ${body}`
        );

        try {
          const requestData = JSON.parse(body);
          responseTimes.push(Number(requestData.responseTime));
        } catch (error) {
          console.error(error);
        }

        res.writeHead(200);
        res.end("OK");
        return;
      }

      if (responseChance < 0.8) {
        res.writeHead(500);
        res.end();
        return;
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(8080, () => console.log("Server started"));

const shutdown = () => {
  server.close(() => console.log("Server stopped"));
  console.log(
    `Response time:\n` +
      `  Median: ${median(responseTimes)}\n` +
      `  Average: ${average(responseTimes)}`
  );
};

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  shutdown();
});
process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  shutdown();
});
