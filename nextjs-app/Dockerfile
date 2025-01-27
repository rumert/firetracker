FROM node:22

WORKDIR /app

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "test" ]; then npx playwright install --with-deps; fi

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000