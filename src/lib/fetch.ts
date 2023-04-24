import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

export async function GET(target: string, headers?: any): Promise<Array<Buffer>> {
  return new Promise((resolve, reject) => {
    const url = new URL(target);
    let data: Array<Buffer> = [];

    (url.protocol === "http:" ? http : https)
      .get({
        hostname: url.hostname,
        path: url.pathname,
        headers,
      }, (res) => {
      res.on("data", (d: Buffer) => { data.push(d) });
      res.on("end", () => {
        console.log(data);
        resolve(data)
      });
      res.on("error", (error) => reject(error));
    })
    .on("error", e => reject(e));
  })
}

export async function POST(target: string, data: string, headers?: any): Promise<Array<Buffer>> {
  const url = new URL(target);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    port: url.port,
    method: "POST",
    headers: {
      ...headers,
      'Content-length': Buffer.byteLength(data),
    }
  }

  return new Promise((resolve, reject) => {
    const request = (url.protocol === "http:" ? http : https)
      .request(options, (res) => {
        let data: Array<Buffer> = [];
        res.on("data", (d: Buffer) => data.push(d));
        res.on("end", () => resolve(data));
    })
    request.on("error", (error) => reject(error));
    request.write(data);
    request.end();
  })
}
