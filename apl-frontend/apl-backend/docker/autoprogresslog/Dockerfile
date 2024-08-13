FROM node:slim
USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:node"]