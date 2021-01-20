FROM node:dubnium

# Install app dependencies
RUN npm install --global gulp-cli
RUN npm install --global serve

# Bundle app source
COPY . /
WORKDIR /
RUN npm install fsevents@latest -f --save-optional
RUN npm install
RUN npm run-script build

EXPOSE 3000
CMD [ "serve", "-s", "build", "-l", "3000" ]
