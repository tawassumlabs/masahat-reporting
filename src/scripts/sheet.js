require('dotenv').config();
const { google } = require('googleapis');
const { fakeCreators } = require('../fake');
const { logger, sleep } = require('../utils');

/**
 * Google Sheet API Authorization
 */
async function authorize() {
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  await jwtClient.authorize().catch((err) => {
    logger.error(err, 'Error while authenticating with Google Sheets API');
    process.exit(1);
  });
  
  return jwtClient;
}

authorize().then(async (jwtClient) => {
  /**
   * Google Sheet API Usage
   */

  const values = fakeCreators(50); // 8 columns * 50 rows -- columns range from A to H
  const sheerang = `creators!A1:H50`;

  await google.sheets({ version: 'v4', auth: jwtClient }).spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: sheerang,
    valueInputOption: 'RAW',
    resource: { values },
  });

  await sleep(5000); // wait for the sheet to update
  logger.info('Sheet updated successfully');
})