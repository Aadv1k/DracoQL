import puppeteer from "puppeteer";

export default async function(url: string): Promise<string> {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0'});
  await page.goto(url, { waitUntil: 'networkidle2' });
  let html = await page.content();
  browser.close();
  return html
}

