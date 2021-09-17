# Clone

```
git clone https://github.com/golos-blockchain/ui-forums
cd ui-forums
```

# Configure

After cloning project with Git, you have 2 files - `config.js` and `configSecure.js` in `ui-forums` folder.

"Main idea" is what you can replace "GolosTalk" in `config.js` and `configSecure.js` with your actual forum name.

But there are also some manipulations **required** to deploy ui-forums on your server. They are described below.

## config.js

You should set `REST_API` to your URL with 5000 port where ui-forums-rest should run. Example: `http://127.0.0.1:5000`.

# Deployment

ui-forums-rest runs on 5000 port, and main ui-forums site runs on [http://localhost:3000](http://localhost:3000)

There are 3 ways to deploy.

## Docker Compose (recommended)

Requires [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

```
docker-compose up
```

## Docker without Compose

Requires [Docker](https://docs.docker.com/engine/install/).

```
sudo docker build -t local/ui-forums-rest -f server/Dockerfile .
sudo docker run -d -p 5000:5000 --name ui-forums-rest local/ui-forums-rest

sudo docker build -t local/ui-forums -f Dockerfile .
sudo docker run -d -p 3000:3000 --name ui-forums local/ui-forums
```

## Manual

Requires [Node.js 16 or newer](https://github.com/nodesource/distributions/blob/master/README.md).

```
cd server
npm install
node index.js & disown
cd ..
npm install --global gulp-cli
npm install
npm start
```

# Troobleshooting

## Wrong statistics of top/comments in categories

Use [fix_stats](fix_stats) tool.
