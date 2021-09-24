FROM node:12.13-alpine

WORKDIR /app

COPY common/. ./common/

COPY ./server/package*.json ./server/

WORKDIR server

RUN npm install

COPY ./server/. .

EXPOSE 3000

CMD ["npm", "run", "start"]
