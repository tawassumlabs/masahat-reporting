require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { sleep, logger } = require('../utils.js');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';

if (fs.existsSync(process.env.USER_DATA_DIR)) {
  process.exit(0);
}

puppeteer.use(stealth());

fs.mkdirSync(process.env.USER_DATA_DIR);

const options = {
  headless: true,
  args: [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--safebrowsing-disable-download-protection',
  ],
  userDataDir: process.env.USER_DATA_DIR
};

puppeteer.launch(options).then(async (browser) => {
  const handleError = async (error, message) => {
    logger.error(message);
    logger.info(error);
    await browser.close();
    process.exit(1);
  }

  const page = await browser.newPage().catch(async (error) => {
    await handleError(error, 'Could not create a new page');
  })

  await page.setUserAgent(UA).catch(async (error) => {
    await handleError(error, 'Could not set the user agent');
  })
  await page.goto(process.env.LOGIN_URL, { waitUntil: 'networkidle2' }).catch(async (error) => {
    await handleError(error, 'Could not navigate to the login url');
  })
  await page.type('input[type="email"]', process.env.USERNAME).catch(async (error) => {
    await handleError(error, 'Could not type the email');
  })
  await page.keyboard.press('Enter').catch(async (error) => {
    await handleError(error, 'Could not press the enter key');
  })
  await sleep(6000);
  await page.type('input[type="password"]', process.env.PASSWORD).catch(async (error) => {
    await handleError(error, 'Could not type the password');
  })
  await page.keyboard.press('Enter').catch(async (error) => {
    await handleError(error, 'Could not press the enter key');
  })
  await sleep(7000);

  await page.goto(process.env.LOOKER_STUDIO_URL, { waitUntil: 'networkidle2' }).catch(async (error) => {
    await handleError(error, 'Could not navigate to the looker studio url');
  })

  await browser.close();
  logger.info('Successfully logged in!');
});