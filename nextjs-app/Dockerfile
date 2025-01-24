FROM node:22

WORKDIR /app

COPY package.json .

RUN npm install

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "test" ]; then npx playwright install --with-deps; fi

COPY . .

EXPOSE 3000