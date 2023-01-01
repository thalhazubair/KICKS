const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const sessionSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
      },
  data: {
    type: mongoose.Mixed,
    required: true
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;