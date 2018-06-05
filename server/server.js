import crc32 from 'crc-32';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import expressWs from 'express-ws';

import logger from 'util';

import User from './models/User';
import Wallet from './models/Wallet';


const app = express();
const ws = expressWs(app);

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));


mongoose.Promise = global.Promise;

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
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
          const tokenPayload = {
            "id": user._id,
            "username": `${user._id}@simplebackoffice.com`
          }
          const token = jwt.sign(tokenPayload, JWT_SECRET);
          return response.status(200)
            .json({
              success: true,
              user: user,
              token,
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
 * Decode a token passed via query string
 */
app.get('/backend/jwtDecode', (request, response) => {
  const token = request.query.token;
  try {
    const data = jwt.verify(token, JWT_SECRET);

    return response.status(200)
      .json({
        data
      });
  } catch (e) {
    return response.status(401)
      .json({
        data: {},
        error: 'Invalid token'
      })
  }
});

/**
 * Get all balances
 */
app.get('/balances', (request, response) => {
  const checksum = request.query.checksum;
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

      const formattedBalances = Object.keys(balances).map((user_id) => {
        return [
          user_id,
          balances[user_id]
        ]
      });

      const balanceChecksum = crc32.str(JSON.stringify(formattedBalances), CHECKSUM_SEED);

      /** Don't send the balance object if checksum is the same */
      return !checksum || Number(checksum) != balanceChecksum ?
        response.status(200)
          .json({
            checksum: balanceChecksum,
            balance: formattedBalances
          }) : 
          response.status(304)
            .json()
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
  const user_id = request.params.userID;
  const {
    currency,
    amount
  } = request.body;

  return Wallet.findOneAndUpdate({
      user_id,
      currency
    }, {
      $inc: {
        balance: Number(amount)
      }
    }, {
      new: true
    }).exec()
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
 * We also need to talk to core so the user does not have any reserved balance
 */

app.post('/withdraw/:userID', (request, response) => {
  const user_id = request.params.userID;
  const {
    currency,
    amount
  } = request.body;

  // Connect to Core and check if user has reserved margin before you allow withdrawal.

  return Wallet.findOneAndUpdate({
      user_id,
      currency
    }, {
      $inc: {
        balance: Number(-amount)
      }
    }, {
      new: true
    }).exec()
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

app.post('/exchange', (request, response) => {
  console.log(request.body.exchange);
  const exchangeData = JSON.parse(request.body.exchange);
  const firstUserData = exchangeData.exchangeUserData1;
  const secondUserData = exchangeData.exchangeUserData2;

  /** Increment the first user's balance */
  return Wallet.findOneAndUpdate({
      user_id: firstUserData.userID,
      currency: firstUserData.currency
    }, {
      $inc: {
        balance: Number(firstUserData.qty)
      }
    }, {
      new: true
    }).exec()
    .then((user1balance) => {
      /** Increment the second user's balance */
      return Wallet.findOneAndUpdate({
          user_id: secondUserData.userID,
          currency: firstUserData.currency
        }, {
          $inc: {
            balance: Number(secondUserData.qty)
          }
        }).exec()
        // Send the acknowledgement message here so we free up the margin since user has been credited? 
        .then((user2balance) => {
          // Exchange acknowledgment should contain the amount to be freed up in margin?
          const exchangeAck = {
            success: true,
            clearMargin: {
              user1: {
                userID: firstUserData.userID,
                currency: secondUserData.currency,
                qty: secondUserData.qty
              },
              user2: {
                userID: secondUserData.userID,
                currency: firstUserData.currency,
                qty: firstUserData.qty
              }
            }
          }

          // Connect to Core here and send creditInfo so it knows.
          logger.log(`Exchange Completed ${exchangeAck}`);

          return response.status(200)
            .json(exchangeAck)
        })
        .catch((error) => {
          return response.status(500)
            .json({
              success: false,
              error: error.message
            })
        });
    })
});

/**
 * Will be fully implemented when we move to websocket.
 */
app.ws('/exchange', (ws, request) => {
  ws.on('message', (message) => {
    /**
     * process the exchange here incrementing and decrementing balances as necessary
     * Send acknowledgement to the middle layer so it can free up reserve and request new balance
     */
    logger.log(message);
  });
});


app.listen(PORT, cb => logger.log(`Running on ${PORT}`))