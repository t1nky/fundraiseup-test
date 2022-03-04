import http from "http";

const responseTimes: number[] = [];

const median = (values: number[]) => {
  if (!values.length) return undefined;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2) return sorted[middle];

  return (sorted[middle - 1] + sorted[middle]) / 2.0;
};

const average = (arr: number[]) => arr.reduce((p, c) => p + c, 0) / arr.length;

const requestListener: http.RequestListener = function (req, res) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      const responseChance = Math.random();
      if (responseChance < 0.6) {
        console.log(`${req.method} ${req.url} ${body}`);

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
    res.writeHead(405);
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(8080, () => console.log("Server started"));

const shutdown = () => {
  server.close(() => console.log("Server stopped"));
  console.log(
    `Response time:\n  Median: ${median(responseTimes)}\n  Average: ${average(
      responseTimes
    )}`
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
