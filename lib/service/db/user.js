const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  avatarUrl: String,

  shareKey: {
    type: String,
    index: true,
  },

  refreshTokens: [{
    token: String,
    issuedAt: Date,
  }],

  satellites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Satellite',
  }],

  identityProvider: {
    kind: {
      type: String,
      index: true,
    },

    user: {
      id: {
        type: String,
        index: true,
      },
    },
  },

  createdAt: Date,
  updatedAt: Date,
});

userSchema.virtual('fullName').get(function() {
  if (!this.firstName && !this.lastName) {
    return null;
  }

  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function() {
  let currentDate = new Date();
  if (!this.createdAt) {
    this.set({ createdAt: currentDate });
  }
  this.set({ updatedAt: currentDate });
});

userSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc._id;
  delete doc.__v;
  delete doc.refreshTokens;

  return doc;
};

module.exports = mongoose.model('User', userSchema);
