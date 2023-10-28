const Queue = require('better-queue');
const { loggers } = require('winston');

const postQueue = new Queue(async ({ req, res }) => {
  // TODO: Implement this function
});

async function post(req, res) {
  loggers.info('Received POST request')
  postQueue.push({ req, res }, (err) => {
    if (err) {
      loggers.error('Error processing POST request', err);
    } else {
      loggers.info('POST request processed successfully');
    }
  });
};

async function get(req, res) {
  res.send('Hello World!');
};

module.exports = { post, get };