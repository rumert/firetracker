FROM node:22

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npm run ${SCRIPT}"]