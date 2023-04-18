import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

export default function fetchBuffer(target: string): Promise<Array<Buffer>> {
  const url = new URL(target);
  return new Promise((resolve, reject) => {
    (url.protocol === "http:" ? http : https).get(url.href, (res) => {
      let data: Array<Buffer> = [];
      res.on("data", (d: Buffer) => data.push(d));
      res.on("end", () => resolve(data));
      res.on("error", (error) => reject(error));
    })
  })
}
