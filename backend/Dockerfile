FROM node:latest

WORKDIR /usr/app/backend

COPY . .
RUN npm install

EXPOSE 443 80

CMD ["npm", "run", "start"]