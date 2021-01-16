FROM node:15-alpine AS build

RUN apk add --no-cache git

ENV NODE_ENV production
ENV GENERATE_SOURCEMAP false

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm ci --only=production \
 && npm ci --only=production --prefix server \
 && npm ci --only=production --prefix client && npm run client:build


FROM node:15-alpine

ENV NODE_ENV production

USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/client/build /usr/src/app/client/build
COPY --chown=node:node --from=build /usr/src/app/fulleffect-hook /usr/src/app/fulleffect-hook
COPY --chown=node:node --from=build /usr/src/app/mdutils /usr/src/app/mdutils
COPY --chown=node:node --from=build /usr/src/app/oncalleffect-hook /usr/src/app/oncalleffect-hook
COPY --chown=node:node --from=build /usr/src/app/server /usr/src/app/server
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json /usr/src/app/package.json

CMD "npm" "start"
