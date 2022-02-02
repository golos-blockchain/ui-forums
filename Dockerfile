FROM node:16.1

# Install app dependencies
RUN yarn add global gulp-cli
RUN yarn add global serve

# Bundle app source
COPY . /
WORKDIR /
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD [ "yarn", "run", "prod" ]
