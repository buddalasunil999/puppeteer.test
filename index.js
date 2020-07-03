const puppeteer = require('puppeteer');
const util = require('util');
const fs = require('fs');
const cssDiff = require('css-diff');

async function runCoverage(viewPort) {
  const browser = await puppeteer.launch({
    headless: false, // The browser is visible
  });
  const page = await browser.newPage();
  if (viewPort) {
    await page.setViewport(viewPort);
  }
  await page.coverage.startCSSCoverage();
  await page.goto('http://localhost:50810', { waitUntil: 'networkidle2' });
  const css_coverage = await page.coverage.stopCSSCoverage();
  //console.log(util.inspect(css_coverage, { showHidden: false, depth: null }));
  createCssCoverage(css_coverage, viewPort);
  await browser.close();
}

function createCssCoverage(css_coverage, viewPort) {
  let final_css_bytes = '';
  let total_bytes = 0;
  let used_bytes = 0;

  for (const entry of css_coverage) {
    console.log(entry.url);
    total_bytes += entry.text.length;
    for (const range of entry.ranges) {
      used_bytes += range.end - range.start - 1;
      final_css_bytes += entry.text.slice(range.start, range.end) + '\n';
    }
  }

  let viewPortFile = '';
  if (viewPort) {
    viewPortFile = `${viewPort.width}x${viewPort.height}`;
  }

  fs.writeFile(
    `./dist/final_css${viewPortFile}.css`,
    final_css_bytes,
    (error) => {
      if (error) {
        console.log('Error creating file:', error);
      } else {
        console.log('File saved');
      }
    }
  );
}
//@media only screen and (max-width: 480px)
//@media only screen and (max-width: 768px)
//@media only screen and (min-width: 768px) and (max-width: 992px)
//@media only screen and (min-width: 992px) and (max-width: 1200px)

Promise.all([
  runCoverage({ width: 360, height: 640 }),
  runCoverage({ width: 640, height: 360 }),
  runCoverage({ width: 768, height: 1024 }),
  runCoverage({ width: 1024, height: 1366 }),
  runCoverage({ width: 1366, height: 768 }),
]).then(() => {
  cssDiff({
    files: ['./dist/final_css360x640.css', './dist/final_css640x360.css'],
    omit: [
      //optional ability to omit rule types
      'comment',
    ],
  }).then(function (diff) {
    console.log(diff.different);
  });
});
