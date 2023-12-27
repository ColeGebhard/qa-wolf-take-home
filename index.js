const { chromium } = require('playwright');
const ObjectsToCsv = require('objects-to-csv');

async function saveHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  await page.goto('https://news.ycombinator.com');

  // Wait for the table to be visible
  const tableSelector = 'table#hnmain .athing';
  await page.waitForSelector(tableSelector, { visible: true});

  // Retrieve articles directly in the page context
  // Query Selector used in portions
  // Seperating All articles
  // Then seperating articles by first ten, and finally the title/url
  const articles = await page.evaluate((tableSelector) => {
    const rows = document.querySelectorAll(tableSelector);
    return Array.from(rows)
      .slice(0, 10)
      .map((row) => {
        const titleElement = row.querySelector('td.title > span.titleline > a');
        return titleElement
          ? {
              title: titleElement.innerText,
              url: titleElement.href,
            }
          : null;
      });
  }, tableSelector);

  // Used a node package to send a csv to top-articles in articles folder
  // Reference https://www.npmjs.com/package/objects-to-csv
  (async () => {
    const csv = new ObjectsToCsv(articles);
  
    // Save to file:
    await csv.toDisk('./articles/top-articles.csv');
  })();
}

(async () => {
  await saveHackerNewsArticles();
})();
