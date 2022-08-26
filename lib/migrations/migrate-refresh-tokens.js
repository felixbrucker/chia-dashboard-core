const mongoose = require('mongoose')

const RefreshToken = require('../service/db/refresh-token')

module.exports = async () => {
  const usersWithRefreshTokens = await mongoose.connection.db
    .collection('users')
    .find({ refreshTokens: { $exists: true } })
    .toArray()

  if (usersWithRefreshTokens.length === 0) {
    return
  }

  const refreshTokensToPersist = []
  for (let user of usersWithRefreshTokens) {
    for (let refreshToken of user.refreshTokens) {
      refreshTokensToPersist.push(new RefreshToken({
        token: refreshToken.token,
        user: new mongoose.Types.ObjectId(user._id.toString()),
        createdAt: refreshToken.issuedAt,
      }))
    }
  }
  await RefreshToken.bulkSave(refreshTokensToPersist)
  await mongoose.connection.db
    .collection('users')
    .updateMany(
      { refreshTokens: { $exists: true } },
      { $unset: { refreshTokens: "" } }
    )
};
