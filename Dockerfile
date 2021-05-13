FROM node:16.1

# Install app dependencies
RUN npm install --global gulp-cli
RUN npm install --global serve

# Bundle app source
COPY . /
WORKDIR /
RUN npm install
RUN chmod +x /docker_run.sh

EXPOSE 3000
CMD ["/docker_run.sh"]
