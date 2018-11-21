FROM node:10.11.0-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY . ./

RUN npm ci

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]

