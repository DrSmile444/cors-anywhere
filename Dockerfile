FROM node:13-alpine3.10

COPY package*.json ./

RUN npm i && mkdir /usr/src/ && mkdir /usr/src/app && cp -R ./node_modules /usr/src/app

WORKDIR /usr/src/app

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
