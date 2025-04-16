# backend/Dockerfile
FROM node:22-slim

WORKDIR /app

COPY package.json ./
COPY .npmrc ./
RUN npm --userconfig ./.npmrc install

COPY . .

RUN npm run generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]