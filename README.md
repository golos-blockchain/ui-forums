# Clone

```
git clone https://github.com/golos-blockchain/ui-forums
cd ui-forums
```

# Configure

After cloning project with Git, you have `config/defailt.js` file in `ui-forums` folder.

"Main idea" is what you can replace "GolosTalk" in `defailt.js` with your actual forum name.

But there are also some manipulations **required** to deploy ui-forums on your server. They are described below.

## defailt.js

You should set `site_domain` to your site domain where forum runs.

# Deployment

Site runs on [http://localhost:3000](http://localhost:3000)

There are 3 ways to deploy.

## Docker Compose (recommended)

Requires [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

```
docker-compose up
```

## Docker without Compose

Requires [Docker](https://docs.docker.com/engine/install/).

```
sudo docker build -t local/ui-forums -f Dockerfile .
sudo docker run -d -p 3000:3000 --name ui-forums local/ui-forums
```

## Manual

Requires [Node.js 16 or newer](https://github.com/nodesource/distributions/blob/master/README.md).

```
yarn install
yarn run start
```

# Troobleshooting

## Wrong statistics of top/comments in categories

Use [fix_stats](fix_stats) tool.
