const puppeteer = require("puppeteer");

async function scrapeLinkedInJobs(page, url) {
  console.log('Navigating to LinkedIn:', url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  } catch (error) {
    console.error('Error navigating to LinkedIn:', error);
    return [];
  }

  let retries = 3;
  while (retries > 0) {
    try {
      await page.waitForTimeout(5000); // Wait for 5 seconds for potential dynamic loading
      const jobCardExists = await page.evaluate(() => document.querySelector('.job-card-container'));

      if (jobCardExists) {
        const jobs = await page.evaluate(() => {
          const jobNodes = document.querySelectorAll('.job-card-container');

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
      } else {
        console.error('No job cards found on the page.');
        retries = 0; // Exit retry loop
        return [];
      }
    } catch (error) {
      console.error('Error during LinkedIn scraping:', error);
      retries--;
      if (retries === 0) {
        console.error('Maximum retries reached. Exiting.');
        throw error; // Throw the last error after maximum retries
      }
      console.log(`Retrying... ${retries} retries left.`);
      // You can also add a delay here before retrying
      return [];
    }
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

  let retries = 3;
  while (retries > 0) {
    try {
      await page.waitForSelector('#sj_d2ab9bc906fa24aa', { timeout: 120000 });

      const jobs = await page.evaluate(() => {
        const jobNodes = document.querySelectorAll('#sj_d2ab9bc906fa24aa');

        const jobDetails = [];
        jobNodes.forEach(node => {
          const title = node.querySelector('.title a').innerText.trim();
          const company = node.querySelector('.company').innerText.trim();
          const location = node.querySelector('.location').innerText.trim();
          const jobDescriptionURL = node.querySelector('.title a').getAttribute('href');

          jobDetails.push({ title, company, location, jobDescriptionURL });
        });

        return jobDetails;
      });

      console.log('Indeed Jobs:', jobs);
      return jobs;
    } catch (error) {
      console.error('Error during Indeed scraping:', error);
      retries--;
      if (retries === 0) {
        console.error('Maximum retries reached. Exiting.');
        throw error; // Throw the last error after maximum retries
      }
      console.log(`Retrying... ${retries} retries left.`);
      // You can also add a delay here before retrying
      return [];
    }
  }
}


(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false, // Set to true for production
  });

  const [linkedInPage, indeedPage] = await Promise.all([
    browser.newPage(),
    browser.newPage(),
  ]);

  try {
    const linkedInJobs = await scrapeLinkedInJobs(
      linkedInPage,
      "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=San%20Diego%2C%20CA&distance=25"
    );
    const indeedJobs = await scrapeIndeedJobs(
      indeedPage,
      "https://www.indeed.com/jobs?q=software+engineer&l=san+diego&radius=25"
    );

    console.log("LinkedIn Jobs:", linkedInJobs);
    console.log("Indeed Jobs:", indeedJobs);
    console.log("Scraping completed.");
  } finally {
    await browser.close();
  }
})();
