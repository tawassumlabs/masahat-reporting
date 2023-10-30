require('dotenv').config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');
const { sleep, logger, exec } = require('./utils');

puppeteer.use(StealthPlugin());

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';

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
  userDataDir: process.env.USER_DATA_DIR,
};

let instance = null;
let page = null;

const handleError = async (error, message) => {
  logger.error(message);
  logger.info(error);
  await instance?.close();
  process.exit(1);
};

async function initBrowserOrExit() {
  const [initialLogin] = await Promise.allSettled([exec('node src/scripts/login.js')]);
  
  if (initialLogin.status === 'rejected') {
    await handleError(initialLogin.reason.error, 'Could not login');
  }

  await puppeteer.launch(options).then(async browser => {
    instance = browser;
    page = await browser.newPage().catch(async (error) => {
      await handleError(error, 'Could not create a new page');
    })

    const workaroundSignedOutGoogleLogin = async () => {
      const cardReLoginFlow = async () => {
        await page.goto(process.env.LOGIN_URL).catch(async (error) => {
          await handleError(error, 'Could not navigate to the login url');
        })
    
        await sleep(5000);
    
        await page.waitForSelector('ul li [role=link]').catch(async (error) => {
          await handleError(error, 'Could not find the account item');
        })
        await page.click('ul li [role=link]').catch(async (error) => {
          await handleError(error, 'Could not click the account item');
        })
        
        await sleep(6000);
        
        await page.type('input[type="password"]', process.env.PASSWORD).catch(async (error) => {
          await handleError(error, 'Could not type the password');
        })
        
        await page.keyboard.press('Enter').catch(async (error) => {
          await handleError(error, 'Could not press the enter key');
        })
        
        await sleep(7000);
      }
  
      await page.goto('https://myaccount.google.com').catch(async (error) => {
        await handleError(error, 'Could not navigate to the looker studio url');
      })
  
      await sleep(5000);
  
      if (!page.url().startsWith('https://myaccount.google.com')) {
        await cardReLoginFlow();
      }
  
      await page.goto(process.env.LOOKER_STUDIO_URL).catch(async (error) => {
        await handleError(error, 'Could not navigate to the looker studio url');
      })
  
      await sleep(5000);
  
      if (page.url().startsWith('https://accounts.google.com')) {
        await cardReLoginFlow();
      }
    }
  
    await page.setUserAgent(UA).catch(async (error) => {
      await handleError(error, 'Could not set the user agent');
    })
  
    await workaroundSignedOutGoogleLogin().catch(async (error) => {
      await handleError(error, 'Could not workaround the signed out google login');
    })

    logger.info('Browser instance initialized successfully');
  }).catch(async (error) => {
    await handleError(error, 'Could not launch the browser');
  })
}

async function getPage() {
  if (!page) {
    throw new Error('Page instance not initialized');
  }
  return page;
}

async function getBrowser() {
  if (!instance) {
    throw new Error('Browser instance not initialized');
  }
  return instance;
}

module.exports = { initBrowserOrExit, getBrowser, getPage };