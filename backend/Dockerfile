FROM node:20

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000
EXPOSE 5000

CMD cd src; node index.js