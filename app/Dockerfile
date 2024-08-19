FROM cypress/base

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run build && sleep 10 && npm start"]