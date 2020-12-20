FROM node:dubnium

# Install app dependencies
RUN npm install --global gulp-cli

# Bundle app source
COPY . /
WORKDIR /
RUN npm install fsevents@latest -f --save-optional
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
