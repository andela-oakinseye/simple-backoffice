import crc32 from 'crc-32';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import logger from 'util';

import User from './models/User';
import Wallet from './models/Wallet';


const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));


mongoose.Promise = global.Promise;

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CHECKSUM_SEED = process.env.CHECKSUM_SEED;

mongoose.connect(
  MONGO_URI,
  (error) => error ?
  logger.log(`Unable to connect`) :
  logger.log(`Connection Successful`)
);

/**
 * Create User
 */
app.post('/user', (request, response) => {
  const _id = mongoose.Types.ObjectId();
  const {
    firstname,
    lastname
  } = request.body;
  const currencies = ['BTC', 'USD', 'EUR'];

  const userWallets = currencies.map((currency) => {
    return {
      user_id: _id,
      currency,
      balance: 1,
    }
  });

  const newUser = new User({
    _id,
    firstname,
    lastname
  })
  return newUser.save()
    .then((user) => {
      return Wallet.insertMany(userWallets)
        .then((wallets) => {
          return response.status(200)
            .json({
              success: true,
              user: user,
              wallets,
            })
        })
    })
    .catch((error) => {
      return response.status(500)
        .json({
          success: false,
          error: error.message
        });
    })
});

/**
 * Get all balances
 */
app.get('/balances', (request, response) => {
  return Wallet.find({}, 'user_id balance currency').exec()
    .then((wallets) => {
      const balances = {};
      // I know this is a bad idea but just for the sake of this test
      wallets.forEach((wallet) => {
        const user_id = wallet.user_id;
        const currency = wallet.currency;
        const balance = wallet.balance;
        if (user_id in balances) {
          balances[user_id][currency] = balance;
        } else {
          balances[user_id] = {
            [currency]: balance
          };
        }
      });

      return response.status(200)
        .json(balances);
    })
    .catch((error) => {
      return response.status(500)
        .json({
          success: false,
          error: error.message,
        })
    });
});

/**
 * Get Checksum of all balances
 */
app.get('/balances/checksum', (request, response) => {
  return Wallet.find({}, 'user_id balance currency').exec()
  .then((wallets) => {
    const balances = {};
    // I know this is a bad idea but just for the sake of this test
    wallets.forEach((wallet) => {
      const user_id = wallet.user_id;
      const currency = wallet.currency;
      const balance = wallet.balance;
      if (user_id in balances) {
        balances[user_id][currency] = balance;
      } else {
        balances[user_id] = {
          [currency]: balance
        };
      }
    });

    return response.status(200)
      .json({
        success: true,
        checksum: crc32.str(JSON.stringify(balances), CHECKSUM_SEED)
      });
  })
  .catch((error) => {
    return response.status(500)
      .json({
        success: false,
        error: error.message,
      })
  });
});

/**
 * deposit fund into s user's wallet
 */

app.post('/deposit/:userID', (request, response) => {
  const user_id  = request.params.userID;
  const { currency, amount } = request.body;

  return Wallet.findOneAndUpdate(
    { user_id, currency }, 
    { $inc: { balance: Number(amount) } }, { new: true }).exec()
    .then((wallet) => {
      // Here, we should send new balance object to the middle layer here so it is updated.
      return response.status(200)
        .json({
          success: true,
          wallet,
        })
    })
    .catch((error) => {
      return response.status(500)
        .json({
          success: false,
          error: error.message
        })
    })
});

/**
 * Withdraw fund from a user's wallet
 * No checks to confirm the user has the balance
 * This code is just for testing purpose
 */

app.post('/withdraw/:userID', (request, response) => {
  const user_id  = request.params.userID;
  const { currency, amount } = request.body;

  return Wallet.findOneAndUpdate(
    { user_id, currency }, 
    { $inc: { balance: Number(-amount)} }, { new: true }).exec()
    .then((wallet) => {

      // We should send new balance object to the middle layer here so it is updated.
      return response.status(200)
        .json({
          success: true,
          wallet,
        })
    })
    .catch((error) => {
      return response.status(500)
        .json({
          success: false,
          error: error.message
        })
    })
});

app.listen(PORT, cb => logger.log(`Running on ${PORT}`))