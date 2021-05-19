Chia-Dashboard-Core
======

The api powering https://dashboard.chia.foxypool.io. No support for users self-hosting, you are on your own.

### Self-Hosting

#### Requirements

- nodejs >= 12
- mongodb
- at least one oauth provider
- a reverse proxy for ssl termination (optional)
- pm2 (optional)

#### Setup

The following is a non-exhaustive list of things that need to be done to self-host the chia dashboard core

- Setup mongodb
- Setup nodejs
- The following env variables are required to run:
    - `DATABASE_URL`
    - `JWT_SIGNING_SECRET`
- Optionally configure your oauth providers via the following env variables:
    - `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`
    - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_ID`
    - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`
