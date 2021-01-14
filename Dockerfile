FROM node:15-alpine

RUN apk add --no-cache git

ENV NODE_ENV production

WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app

RUN npm ci --only=production \
 && npm ci --only=production --prefix server \
 && npm ci --only=production --prefix client && npm run client:build

USER node
CMD "npm" "start"
