FROM node:dubnium

# Install app dependencies
RUN npm install --global gulp-cli
RUN npm install --global serve

# Bundle app source
COPY . /
WORKDIR /
RUN npm install fsevents@latest -f --save-optional
RUN npm install
RUN chmod +x /docker_run.sh

EXPOSE 3000
CMD ["/docker_run.sh"]
