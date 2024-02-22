class Config {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL;
    this.listenHost = process.env.LISTEN_HOST || '0.0.0.0';
    this.listenPort = parseInt(process.env.PORT, 10) || 5000;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.jwtSigningSecret = process.env.JWT_SIGNING_SECRET;
    this.discord = {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    };
    this.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
    this.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
    this.ssl = {
      cert: process.env.SSL_CERT ? Buffer.from(process.env.SSL_CERT, 'base64').toString('ascii') : null,
      key: process.env.SSL_KEY ? Buffer.from(process.env.SSL_KEY, 'base64').toString('ascii') : null,
    };
    this.isMaster = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE === '0' : true;
    this.sentryDsn = process.env.SENTRY_DSN;
    this.allowedDiscordGuild = process.env.ALLOWED_DISCORD_GUILD || null;
    this.disableSingup = process.env.DISABLE_SIGNUP === 'true';
    this.cloudflaredTunnelToken = process.env.CLOUDFLARED_TUNNEL_TOKEN
  }

  get isSslEnabled() {
    return !!this.ssl.cert && !!this.ssl.key;
  }
}

module.exports = new Config();
