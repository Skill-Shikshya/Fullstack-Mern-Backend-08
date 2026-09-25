#Pulling a node installed small linux system
FROM node:20-alpine

#Make a dir where the files will go
WORKDIR /app

#Copy all the package.anythig-in-between-.json 
COPY package*.json ./

#run the install command to install 
RUN npm install

#Copy everything which is not in .gitignore file
COPY . .

#Expose a port
EXPOSE 3000

#Run the command
CMD ["npm", "run", "dev"]


