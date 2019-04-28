### STAGE 1: Build ###
FROM node:10.14.0 as build

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json

RUN npm install --silent
RUN npm install react-scripts -g --silent

COPY . /usr/src/app

RUN npm run build

### STAGE 2: Production Environment ###
FROM nginx:1.15.12-alpine

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/src/nginx/html

ENV PORT=4200
EXPOSE $PORT

CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'