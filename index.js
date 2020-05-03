const puppeteer = require("puppeteer");
const util = require("util");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // The browser is visible
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 736 });
  await page.coverage.startCSSCoverage();
  await page.goto("https://www.google.com", { waitUntil: "networkidle2" });
  const css_coverage = await page.coverage.stopCSSCoverage();
  console.log(util.inspect(css_coverage, { showHidden: false, depth: null }));
  createCssCoverage(css_coverage);
  await browser.close();
})();

function createCssCoverage(css_coverage) {
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

  fs.writeFile("./final_css.css", final_css_bytes, (error) => {
    if (error) {
      console.log("Error creating file:", error);
    } else {
      console.log("File saved");
    }
  });
}
