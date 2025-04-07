FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./
RUN npm --userconfig ./.npmrc install --legacy-peer-deps

COPY . .
RUN npm run generate
RUN npm run build 

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80