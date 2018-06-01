import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
  _id: Schema.Types.ObjectId,
  firstname: String,
  lastname: String,
});

export default mongoose.model('User', User);
