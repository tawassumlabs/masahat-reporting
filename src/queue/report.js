const { logger } = require('../utils');
const Queue = require('better-queue');
const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('../utils');
const { get } = require('http');
const { getPdf } = require('../scripts/save-pdf');
const { getPage } = require('../browser');

const writeFileAsync = promisify(fs.writeFile);

const reportQueueStatus = [];

const reportQueue = new Queue(async ({ filename, cells, sheetrange }, cb) => {
  const status = reportQueueStatus.find((job) => job.id === filename);

  status.status = 'processing';

  const handleErr = (err) => {
    logger.error(`Error processing job ${filename}`, err);
    status.status = 'failed';
    cb(err);
  };

  // write data to /tmp/data
  const [disk] = await Promise.allSettled([writeFileAsync('/tmp/data', JSON.stringify(cells))]);

  if (disk.status === 'rejected') {
    return handleErr(disk.reason.error);
  }

  // update looker studio data source
  const [sheet] = await Promise.allSettled([exec(`node src/scripts/sheet.js ${sheetrange} /tmp/data`)]);

  if (sheet.status === 'rejected') {
    return handleErr(sheet.reason.error);
  }
  
  const [page] = await Promise.allSettled([getPage()]);

  if (page.status === 'rejected') {
    return handleErr(page.reason.error);
  }

  // refresh looker studio and download pdf to s3
  const [pdf] = await Promise.allSettled([getPdf(page.value, filename)]);

  if (pdf.status === 'rejected') {
    return handleErr(pdf.reason.error);
  }

  const publicUrl = `https://s3.amazonaws.com/${process.env.AWS_BUCKET}/${filename}`;

  status.status = 'complete';
  status.results = publicUrl;
  cb();
});

module.exports = { queue: reportQueue, jobs: reportQueueStatus };