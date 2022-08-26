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
}, {
  timestamps: true,
  autoIndex: true,
});

userSchema.virtual('fullName').get(function() {
  if (!this.firstName && !this.lastName) {
    return null;
  }

  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc._id;
  delete doc.__v;

  return doc;
};

module.exports = mongoose.model('User', userSchema);
