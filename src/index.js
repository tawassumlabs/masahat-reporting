require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initBrowserOrExit } = require('./browser');
const { logger } = require('./utils');
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/logs', require('./api/logs'));
app.get('/api/report', require('./api/report').get);
app.post('/api/report', require('./api/report').post);
app.post('/api/data', require('./api/data'));

app.listen(port, async () => {
  logger.info(`Server listening on port ${port}`);
  logger.info('Initializing browser instance...');
  initBrowserOrExit()
});