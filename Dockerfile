FROM node:14-apine
ENV NODE_ENV prod
WORKDIR /restserver
COPY package.json /restserver
RUN npm install
COPY . /restServer
CMD [ "node", "server.js" ]
EXPOSE 8080
#Remember to link this image with the docker that is running mondodb (--link yourmongodbserver:db)
