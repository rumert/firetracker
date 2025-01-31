FROM node:22

WORKDIR /app

COPY package.json .

RUN yarn install --frozen-lockfile 

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "test" ]; then yarn playwright install --with-deps; fi

COPY . .

EXPOSE 3000