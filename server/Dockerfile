FROM node:16.1

RUN mkdir -p /server
WORKDIR /server

# Install app dependencies
RUN npm install --global gulp-cli

# Bundle app source
COPY config.js /
COPY server/ /server/
WORKDIR /server
RUN npm install

EXPOSE 5000
CMD [ "node", "index.js" ]
