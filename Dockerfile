FROM node:16.1

# Bundle app source
COPY . /
WORKDIR /
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD [ "yarn", "run", "prod" ]
