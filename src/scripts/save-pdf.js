require('dotenv').config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');
const { put } = require('../lib/s3.js');
const { sleep, logger } = require('../utils.js');

const FILENAME = process.argv[2] || `${new Date().toISOString()}.pdf`;

puppeteer.use(StealthPlugin());

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

  await page.goto(process.env.LOOKER_STUDIO_URL).catch(async (error) => {
    await handleError(error, 'Could not navigate to the looker studio url');
  })

  await page.waitForSelector('#more-options-header-menu-button').catch(async (error) => {
    await handleError(error, 'Could not find the more options button');
  })

  await page.click('#more-options-header-menu-button').catch(async (error) => {
    await handleError(error, 'Could not click the more options button');
  })

  await sleep(1000);

  await page.waitForSelector('#header-refresh-button').catch(async (error) => {
    await handleError(error, 'Could not find the refresh button');
  })

  await page.click('#header-refresh-button').catch(async (error) => {
    await handleError(error, 'Could not click the refresh button');
  })

  await sleep(1000 * 10);

  await page.waitForSelector('[aria-label="More options"]').catch(async (error) => {
    await handleError(error, 'Could not find the more options button');
  })

  await page.click('[aria-label="More options"]').catch(async (error) => {
    await handleError(error, 'Could not click the more options button');
  })

  await sleep(1000);

  await page.waitForSelector('[role="menu"] button:last-child').catch(async (error) => {
    await handleError(error, 'Could not find the download item in share menu');
  })

  await page.click('[role="menu"] button:last-child').catch(async (error) => {
    await handleError(error, 'Could not click the download item in share menu');
  })

  await sleep(1000);

  await page.waitForSelector('md-dialog-actions button:last-child').catch(async (error) => {
    await handleError(error, 'Could not find the download button in download dialog');
  })

  page.on('response', async (response) => {
    if (response.url().startsWith('https://lookerstudio.google.com/getPdf')) {
      const base64String = await response.text().catch(async (error) => {
        await handleError(error, 'Could not get the base64 string from the response');
      })
      
      await put({
        Bucket: process.env.AWS_BUCKET,
        Key: FILENAME,
        Body: Buffer.from(base64String, 'base64'),
        ContentType: 'application/pdf',
        ACL: 'public-read',
      }).then(async () => {
        logger.info(`Saved New Report To S3:\nhttps://s3.amazonaws.com/${process.env.AWS_BUCKET}/${FILENAME}`);

        await browser.close();
        process.exit(0);
      }).catch(async (error) => {
        await handleError(error, 'Could not upload the pdf to s3');
      })
    }
  })

  await page.click('md-dialog-actions button:last-child').catch(async (error) => {
    await handleError(error, 'Could not click the download button in download dialog');
  })
})