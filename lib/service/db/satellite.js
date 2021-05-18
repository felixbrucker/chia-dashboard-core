const mongoose = require('mongoose');

const satelliteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  apiKey: {
    type: String,
    unique: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  services: {
    farmer: {
      stats: mongoose.Schema.Types.Mixed,
      lastUpdate: Date,
    },
    harvester: {
      stats: mongoose.Schema.Types.Mixed,
      lastUpdate: Date,
    },
    fullNode: {
      stats: mongoose.Schema.Types.Mixed,
      lastUpdate: Date,
    },
    wallet: {
      stats: mongoose.Schema.Types.Mixed,
      lastUpdate: Date,
    },
    plotter: {
      stats: mongoose.Schema.Types.Mixed,
      lastUpdate: Date,
    },
  },

  version: {
    type: String,
  },

  createdAt: Date,
  updatedAt: Date,
});

satelliteSchema.pre('save', async function() {
  let currentDate = new Date();
  if (!this.createdAt) {
    this.set({ createdAt: currentDate });
  }
  this.set({ updatedAt: currentDate });
});

satelliteSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.__v;
  delete doc.apiKey;
  delete doc.user;

  return doc;
};

module.exports = mongoose.model('Satellite', satelliteSchema);
