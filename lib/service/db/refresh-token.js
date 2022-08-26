const mongoose = require('mongoose')

const sevenDaysInSeconds = 60 * 60 * 24 * 7

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    index: true,
    unique: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
  autoIndex: true,
})

refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: sevenDaysInSeconds })

module.exports = mongoose.model('RefreshToken', refreshTokenSchema)
