#DOCKER FILE IS JUST A TEMPLATE WHICH WILL BE USED TO CREATE THE IMAGE OF THE CODE
#the below command ensures that we are using node as the runtime, it has npm pre-installed, so we can use npm install 
FROM node
# this is the directory where our code will be stored
ENV APP_HOME="/app/claimmd"
WORKDIR ${APP_HOME}
# WORKDIR /app
#we can copy the package.json in the docker image 
COPY claimmd/package.json .
# COPY package.json .
# here we are copying all the code and everything to the docker image
COPY claimmd/. .

# we are installing the dependencies here,
RUN npm install
COPY claimmd/. .

# port needs to be exposed where this service has to run
EXPOSE 3000
# running the command or the code we can also use CMD ["node", "src/index.js"]
CMD ["npm", "run", "start"]


