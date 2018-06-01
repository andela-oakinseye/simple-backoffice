import express from 'express';
import crc32 from 'crc-32';

import logger from 'util';

import balances from './data/balances'

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/balances', (request, response) => {
  return response.status(200)
    .json(balances);
});

app.get('/balances/checksum', (request, response) => {
  const allBalances = JSON.stringify(balances);
  const seed = 7337
  const balanceChecksum = crc32.str(allBalances, seed);
  return response.status(200)
    .json({
      success: true,
      checksum: balanceChecksum
    })
});


app.listen(PORT, cb => logger.log(`Running on ${PORT}`))