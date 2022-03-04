import https from "https";
import http from "http";
import { PingReport } from "../types/PingReport";
import { PingResult } from "../types/PingResult";
import { waitFor } from "../helpers";
import { PingStatistics } from "../types/PingStatistics";
import { PingReportResult } from "../types/PingReportResult";
import { RequestErrors } from "../types/RequestErrors";

class PingClient {
  private readonly maxSleep = 30;

  private pingId = -1;
  private active = false;
  public stats: PingStatistics = {
    total: 0,
    success: 0,
    error500: 0,
    timeout: 0,
  };
  constructor(public pingUrl: string, public reportUrl: string) {}

  private async sleepOrStop(seconds: number): Promise<void> {
    await waitFor(() => this.active === false, seconds);
  }

  private reportPingResult(data: PingReport): Promise<PingReportResult> {
    const dataString = JSON.stringify(data);

    const options: https.RequestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": dataString.length,
      },
      timeout: 10000,
    };

    return new Promise<PingReportResult>((resolve, reject) => {
      const req = http.request(this.reportUrl, options, (res) => {
        const data: Uint8Array[] = [];
        if (res.statusCode === RequestErrors.INTERNAL_SERVER_ERROR) {
          resolve({ code: RequestErrors.INTERNAL_SERVER_ERROR });
        }
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => {
          resolve({
            code: RequestErrors.OK,
            data: Buffer.concat(data).toString(),
          });
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ code: RequestErrors.TIMEOUT });
      });

      req.write(dataString);
      req.end();
    });
  }

  private performPing() {
    this.pingId += 1;

    const options: https.RequestOptions = {
      timeout: 10000,
    };

    return new Promise<PingResult>((resolve, reject) => {
      const startTime = new Date().getTime();
      const req = https.get(this.pingUrl, options, (res) => {
        res.on("data", () => true);
        res.on("end", () => {
          const endTime = new Date().getTime();
          resolve({ date: startTime, responseTime: endTime - startTime });
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request time out"));
      });

      req.end();
    });
  }

  private updateStats(reportResult: PingReportResult) {
    this.stats.total += 1;

    switch (reportResult.code) {
      case RequestErrors.INTERNAL_SERVER_ERROR:
        this.stats.error500 += 1;
        break;
      case RequestErrors.TIMEOUT:
        this.stats.timeout += 1;
        break;
      default:
        this.stats.success += 1;
        break;
    }
  }

  public async start() {
    this.active = true;

    while (this.active) {
      try {
        const pingResult = await this.performPing();
        let deliveryAttempt = 0;
        while (this.active) {
          console.log("Sending report");

          try {
            const reportResult = await this.reportPingResult({
              ...pingResult,
              deliveryAttempt,
              pingId: this.pingId,
            });
            console.log(
              `Report request result [${reportResult.code}] ${
                reportResult.data ?? ""
              }`
            );

            this.updateStats(reportResult);

            if (reportResult.code === RequestErrors.OK) {
              break;
            }
          } catch (error) {
            console.error(new Date(), error);
          }

          await this.sleepOrStop(
            Math.min((deliveryAttempt + 1) * 2, this.maxSleep)
          );
          deliveryAttempt += 1;
        }
      } catch (error) {
        console.error(new Date(), error);
      }

      await this.sleepOrStop(1);
    }
  }

  public stop() {
    this.active = false;
  }
}

export { PingClient };
