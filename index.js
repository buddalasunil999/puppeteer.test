const puppeteer = require("puppeteer");
const util = require("util");
const fs = require("fs");

async function runCoverage(viewPort) {
  const browser = await puppeteer.launch({
    headless: false, // The browser is visible
  });
  const page = await browser.newPage();
  if (viewPort) {
    await page.setViewport(viewPort);
  }
  await page.coverage.startCSSCoverage();
  await page.goto("https://www.google.com", { waitUntil: "networkidle2" });
  const css_coverage = await page.coverage.stopCSSCoverage();
  //console.log(util.inspect(css_coverage, { showHidden: false, depth: null }));
  createCssCoverage(css_coverage, viewPort);
  await browser.close();
}

function createCssCoverage(css_coverage, viewPort) {
  let final_css_bytes = "";
  let total_bytes = 0;
  let used_bytes = 0;

  for (const entry of css_coverage) {
    total_bytes += entry.text.length;
    for (const range of entry.ranges) {
      used_bytes += range.end - range.start - 1;
      final_css_bytes += entry.text.slice(range.start, range.end) + "\n";
    }
  }

  let viewPortFile = "";
  if (viewPort) {
    viewPortFile = `${viewPort.width}x${viewPort.height}`;
  }

  fs.writeFile(
    `./dist/final_css${viewPortFile}.css`,
    final_css_bytes,
    (error) => {
      if (error) {
        console.log("Error creating file:", error);
      } else {
        console.log("File saved");
      }
    }
  );
}

runCoverage({ width: 414, height: 736 }); //iphone
runCoverage({ width: 1024, height: 1366 }); //ipad pro portrait
runCoverage({ width: 1366, height: 1024 }); //ipad pro landscape
