require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * Uploads a file to S3 (overwriting existing file if input.Key already exists)
 * 
 * @param {import("@aws-sdk/client-s3").PutObjectCommandInput} input
 * @returns {Promise<any>}
 */
async function put(input) {
  return await client.send(new PutObjectCommand(input));
}

module.exports = { put };