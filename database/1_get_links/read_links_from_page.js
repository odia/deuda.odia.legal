import puppeteer from 'puppeteer';
import fs from "fs";

const TARGET_URI = process.argv[2]

if (!TARGET_URI) {
  console.error("missing target URI")
  process.exit(1)
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setRequestInterception(true);

  page.on('request', interceptedRequest => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    const url = interceptedRequest.url()
    if (url.endsWith('/')) {
      interceptedRequest.continue();
    } else {
      interceptedRequest.abort();
    }
  });

  await page.setViewport({ width: 1080, height: 1024 });

  const contentHtml = fs.readFileSync(TARGET_URI, 'utf8');
  page.setContent(contentHtml);

  try {

    await page.waitForSelector('#block-system-main');
    const titulos = (await page.$$eval("#block-system-main h1", els => els.map(e => e.innerHTML)))
    if (titulos.length !== 1) {
      console.error(`Expected just 1 title: ${titulos.length}`);
      process.exit(1)
    }
    const links = (await page.$$eval("#block-system-main table td>a", els => els.map(e => e.href)))

    links.forEach(link => {
      if (link.endsWith("zip")) {
        console.log(link)
      }
    })
  } catch (e) {
    console.error(`Error trying to read links: ${e.message}`);
  }

  await browser.close();

})();

