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
    daemon: {
      stats: {
        version: String,
      },
      lastUpdate: Date,
    },
    farmer: {
      stats: {
        averageHarvesterResponseTime: Number,
        worstHarvesterResponseTime: Number,
        farmingInfos: {
          type: [{
            proofs: Number,
            passedFilter: Number,
            receivedAt: String,
            lastUpdated: String,
          }],
          default: undefined,
        },
        nodeId: String,
      },
      lastUpdate: Date,
    },
    harvester: {
      stats: {
        ogPlots: {
          count: Number,
          rawCapacityInGib: String,
          effectiveCapacityInGib: String,
        },
        nftPlots: {
          count: Number,
          rawCapacityInGib: String,
          effectiveCapacityInGib: String,
        },
        plotCount: Number,
        totalRawPlotCapacityInGib: String,
        totalEffectivePlotCapacityInGib: String,
        farmerConnectionsCount: Number,
        nodeId: String,
      },
      lastUpdate: Date,
    },
    fullNode: {
      stats: {
        fullNodeConnectionsCount: Number,
        blockchainState: {
          difficulty: Number,
          spaceInGib: String,
          syncStatus: {
            synced: Boolean,
            syncing: Boolean,
            syncedHeight: Number,
            tipHeight: Number,
          },
        },
      },
      lastUpdate: Date,
    },
    wallet: {
      stats: {
        wallets: {
          type: [{
            id: Number,
            name: String,
            type: {
              type: Number,
            },
            balance: {
              unconfirmed: String,
            },
          }],
          default: undefined,
        },
        syncStatus: {
          synced: Boolean,
          syncing: Boolean,
          syncedHeight: Number,
        },
        farmedAmount: {
          lastHeightFarmed: Number,
        },
        fingerprint: Number,
      },
      lastUpdate: Date,
    },
    plotter: {
      stats: {
        completedPlotsToday: Number,
        completedPlotsYesterday: Number,
        jobs: {
          type: [{
            id: String,
            state: String,
            kSize: Number,
            phase: Number,
            progress: Number,
            startedAt: String,
          }],
          default: undefined,
        },
      },
      lastUpdate: Date,
    },
  },

  version: {
    type: String,
  },
}, {
  timestamps: true,
  autoIndex: true,
});

satelliteSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.__v;
  delete doc.apiKey;
  delete doc.user;

  return doc;
};

module.exports = mongoose.model('Satellite', satelliteSchema);
