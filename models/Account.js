const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم حساب Steam مطلوب'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'بريد الحساب مطلوب']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة']
  },
  games: [{
    name: String,
    image: String
  }],
  description: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  downloads: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
