# Clone

```
git clone https://github.com/golos-blockchain/chainbb-frontend
cd chainbb-frontend
```

# Configure

After cloning project with Git, you have 2 files - `config.js` and `configSecure.js` in `chainbb-frontend` folder.

"Main idea" is what you can replace "GolosTalk" in `config.js` and `configSecure.js` with your actual forum name.

But there are also some manipulations **required** to deploy chainBB on your server. They are described below.

## config.js

You should set `REST_API` to your URL with 5000 port where chainbb-rest should run. Example: `http://127.0.0.1:5000`.

## configSecure.js

You should set `account` to account which should be used as creator of new accounts, `referer` to account which should be used as referer for them, `signing_key` to active private key of `account`, and `gmail_send` to some @gmail.com mailbox which should be used as sender of registration emails (`pass` should be an [**application** password](https://support.google.com/mail/answer/185833), not just password of your mailbox).

# Deployment

chainbb-rest runs on 5000 port, and main chainbb site runs on [http://localhost:3000](http://localhost:3000)

There are 3 ways to deploy.

## Docker Compose (recommended)

Requires [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

```
docker-compose up
```

## Docker without Compose

Requires [Docker](https://docs.docker.com/engine/install/).

```
sudo docker build -t local/chainbb-rest -f server/Dockerfile .
sudo docker run -d -p 5000:5000 --name chainbb-rest local/chainbb-rest

sudo docker build -t local/chainbb -f Dockerfile .
sudo docker run -d -p 3000:3000 --name chainbb local/chainbb
```

## Manual

Requires [Node.js 10 or newer](https://github.com/nodesource/distributions/blob/master/README.md).

```
cd server
npm install
node index.js & disown
cd ..
npm install --global gulp-cli
npm install fsevents@latest -f --save-optional
npm install
npm start
```