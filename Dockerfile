FROM node:alpine3.11
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install
CMD ["npm", "start"]