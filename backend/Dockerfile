FROM node:latest

WORKDIR /usr/app/backend

COPY . .
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]