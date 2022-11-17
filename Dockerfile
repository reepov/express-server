FROM node:alpine as base

WORKDIR /server

COPY package.json yarn.lock ./

RUN rm -rf node_modules && yarn install --frozen-lockfile && yarn cache clean

COPY ./src ./src

CMD ["node", "./src/index.js"]