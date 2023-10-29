require('dotenv').config();
const { google } = require('googleapis');
const { logger } = require('../utils');
const fs = require('fs');

const SHEERANG = process.argv[2];
const DATA_PATH = process.argv[3];

if (!SHEERANG || !fs.existsSync(DATA_PATH)) {
  logger.error('Please provide a sheerang and a data path');
  process.exit(1);
}

const values = JSON.parse(fs.readFileSync(DATA_PATH));

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

authorize().then(jwtClient => {
  /**
   * Google Sheet API Usage
   */
  
  const params = {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: SHEERANG,
    valueInputOption: 'RAW',
    resource: { values },
  }

  google.sheets({ version: 'v4', auth: jwtClient }).spreadsheets.values.update(params, (err, res) => {
    if (err) {
      logger.error(err, 'Error while updating Google Sheet');
      process.exit(1);
    }
    
    logger.info('Sheet updated successfully');
  });

})