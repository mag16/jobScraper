const puppeteer = require('puppeteer');

async function scrapeLinkedInJobs(page, url) {
  console.log('Navigating to LinkedIn:', url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  } catch (error) {
    console.error('Error navigating to LinkedIn:', error);
    return [];
  }

  try {
    await page.waitForSelector('.jobs-search-results__list', { timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll('.jobs-search-results__list-item');

      const jobDetails = [];
      jobNodes.forEach(node => {
        const title = node.querySelector('.job-card-container__title').innerText.trim();
        const company = node.querySelector('.job-card-container__subtitle').innerText.trim();
        const location = node.querySelector('.job-card-container__metadata-item').innerText.trim();
        const jobDescriptionURL = node.querySelector('.job-card-container__link').getAttribute('href');

        jobDetails.push({ title, company, location, jobDescriptionURL });
      });

      return jobDetails;
    });

    console.log('LinkedIn Jobs:', jobs);
    return jobs;
  } catch (error) {
    console.error('Error during LinkedIn scraping:', error);
    return [];
  }
}

async function scrapeIndeedJobs(page, url) {
  console.log('Navigating to Indeed:', url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  } catch (error) {
    console.error('Error navigating to Indeed:', error);
    return [];
  }

  try {
    await page.waitForSelector('.jobsearch-SerpJobCard', { timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll('.jobsearch-SerpJobCard');

      const jobDetails = [];
      jobNodes.forEach(node => {
        const titleElement = node.querySelector('.title a');
        const title = titleElement ? titleElement.innerText.trim() : 'N/A';

        const descriptionElement = node.querySelector('.summary');
        const description = descriptionElement ? descriptionElement.innerText.trim() : 'N/A';

        const applyUrlElement = node.querySelector('.title a');
        const applyUrl = applyUrlElement ? applyUrlElement.href : 'N/A';

        jobDetails.push({ title, description, applyUrl });
      });

      return jobDetails;
    });

    console.log('Indeed Jobs:', jobs);
    return jobs;
  } catch (error) {
    console.error('Error during Indeed scraping:', error);
    return [];
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false, // Set to true for production
  });

  const [linkedInPage, indeedPage] = await Promise.all([
    browser.newPage(),
    browser.newPage(),
  ]);

  try {
    const linkedInJobs = await scrapeLinkedInJobs(linkedInPage, 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=San%20Diego%2C%20CA&distance=25');
    const indeedJobs = await scrapeIndeedJobs(indeedPage, 'https://www.indeed.com/jobs?q=software+engineer&l=san+diego&radius=25');

    console.log('LinkedIn Jobs:', linkedInJobs);
    console.log('Indeed Jobs:', indeedJobs);
    console.log('Scraping completed.');
  } finally {
    await browser.close();
  }
})();
