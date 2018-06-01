import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Wallet = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  currency: {
    type: String,
    enum: ["BTC", "USD", "EUR"]
  },
  balance: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('Wallet', Wallet);
