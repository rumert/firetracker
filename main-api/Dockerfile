FROM node:22

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD cd src; node index.js