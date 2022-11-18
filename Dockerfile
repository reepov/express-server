FROM node:alpine as base

WORKDIR /server

COPY package.json yarn.lock ./

RUN rm -rf node_modules && yarn install && yarn cache clean

COPY ./src ./src

EXPOSE 3333

CMD ["node", "./src/index.js"]