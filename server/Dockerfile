FROM node:dubnium

RUN mkdir -p /server
WORKDIR /server

# Install app dependencies
RUN npm install --global gulp-cli

# Bundle app source
COPY config.js /
COPY configSecure.js /
COPY server/ /server/
WORKDIR /server
RUN npm install

EXPOSE 5000
CMD [ "node", "index.js" ]
