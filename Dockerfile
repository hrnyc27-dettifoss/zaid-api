FROM node:latest
COPY . .
RUN npm install
CMD node server/routes.js