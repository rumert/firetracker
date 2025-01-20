FROM node:22

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npm run ${SCRIPT}"]