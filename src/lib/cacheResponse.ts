import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const CACHE_DIR = "html-cache";
const TIMEOUT_IN_MS = 6e5 + (6e4 * 5) // 10 minutes + 5 minutes

export function cache(html: string, url: string, dir?: string): void {
  const cacheFolder = path.join(dir ?? "./", CACHE_DIR);

  try {
    mkdirSync(cacheFolder);
  } catch {};

  const dateInMS = Date.now();
  const fp = path.join(cacheFolder, `${createHash("md5").update(url).digest("hex")}.json`);

  writeFileSync(fp, JSON.stringify({
    cachedAt: dateInMS,
    content: html
  }))
}


export function getCachedHtmlOrNull(url: string, dir?: string, timeout?: number): {
  cachedAt: number,
  content: string,
} | null {
  const hashedUrl = createHash("md5").update(url).digest("hex");
  const cacheFolder = path.join(dir ?? "./", CACHE_DIR);
  const cacheTarget = path.join(cacheFolder, `${hashedUrl}.json`);

  if (existsSync(cacheTarget)) {
    const data = JSON.parse(readFileSync(cacheTarget, "utf-8"));
    if ((Date.now() - data.cachedAt) < (timeout ?? TIMEOUT_IN_MS)) {
      return {
        cachedAt: data.cachedAt,
        content: data.content
      }
    }
  }
  return null;
}


