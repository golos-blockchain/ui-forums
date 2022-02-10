FROM node:16.1 as build

# Bundle app source
WORKDIR /var/app
RUN mkdir -p /var/app
COPY . /var/app
RUN yarn install
RUN yarn build

FROM node:16.1 as prod
WORKDIR /var/app
COPY --from=build /var/app /var/app

EXPOSE 3000
CMD [ "yarn", "run", "prod" ]
