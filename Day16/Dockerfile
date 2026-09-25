# add the node image
#FROM node:20
#FROM node:20-slim
#FROM node:20-alpine

FROM node:20-alpine

#work dir in container
WORKDIR /app

#copy the package.json files
COPY package*.json .

#run the install command
Run npm install

#copy the project what is not in docker ignore
COPY . .

#expose Port
EXPOSE 3000

#run the command
CMD ["node", "app.js"]
