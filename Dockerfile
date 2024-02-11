FROM node:18-slim
LABEL author="arnaud"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY front ./front
COPY back ./back

EXPOSE 8000

CMD ["npm", "start"]